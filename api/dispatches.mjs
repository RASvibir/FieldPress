// Consolidated dispatches endpoint — one serverless function handling the
// collection and single-item routes, merged purely to stay under Vercel's
// per-plan serverless function cap. URLs are unchanged: requests to
// /api/dispatches/:id are rewritten (see vercel.json) to
// /api/dispatches?id=:id before reaching this handler, so the frontend
// needs no changes.
//
// GET    /api/dispatches            -> published dispatches from every account (public feed)
// GET    /api/dispatches?mine=1     -> the caller's own dispatches, published + press-roll
// POST   /api/dispatches            -> create a dispatch (published or press-roll) owned by the caller
// GET    /api/dispatches/:id        -> a single dispatch (public if published, owner-only if press-roll)
// PUT    /api/dispatches/:id        -> update a dispatch (owner only)
// DELETE /api/dispatches/:id        -> delete a dispatch (owner only)
//
// All writes require an authenticated session. Reads of the public feed
// don't require auth (matches the app's existing "browse without an
// account" behavior); ?mine=1 requires auth since it's account-scoped.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "./_lib/auth.mjs";
import resolveEmbed from "./_lib/resolveEmbed.mjs";

const sql = neon(process.env.DATABASE_URL);

// Deterministically quantizes & offsets any coordinate to a coarse ~4-6 km
// (~3 mile) regional vicinity sector (2 decimal places, ~0.04 deg grid) so
// exact street/house GPS coordinates are never stored or exposed publicly.
function fuzzVicinityCoord(val, seedStr = "fp") {
  if (typeof val !== "number" || !Number.isFinite(val)) return null;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) | 0;
  }
  const offset = (((hash % 17) - 8) / 1000); // +/- 0.008 deg (~0.8 km jitter on top of 0.04 deg grid)
  const quantized = Math.round(val * 25) / 25; // ~4.4 km grid step
  return Number((quantized + offset).toFixed(2));
}

function toClientShape(row, callerId = null) {
  const isAnon =
    row.callsign === "anon-signal" ||
    (typeof row.author === "string" && row.author.toLowerCase().includes("anonymous")) ||
    (typeof row.bureau === "string" && row.bureau.includes("Metadata Stripped"));
  const isDecoupled =
    isAnon ||
    (typeof row.bureau === "string" && row.bureau.includes("Pin Decoupled")) ||
    (typeof row.location === "string" && row.location.includes("Vicinity"));

  const isOwner = Boolean(callerId && row.account_id === callerId);
  const safeLat = row.latitude != null ? fuzzVicinityCoord(Number(row.latitude), row.id + "lat") : null;
  const safeLng = row.longitude != null ? fuzzVicinityCoord(Number(row.longitude), row.id + "lng") : null;

  return {
    id: row.id,
    // Strip accountId from public wire responses when anonymous unless viewed by the owner
    accountId: isAnon && !isOwner ? "anon-redacted" : row.account_id,
    title: row.title,
    category: row.category,
    author: isAnon ? "Anonymous Field Source" : row.author,
    callsign: isAnon ? "anon-signal" : row.callsign,
    bureau: row.bureau,
    location: row.location || undefined,
    coordinates: safeLat != null && safeLng != null ? [safeLng, safeLat] : undefined,
    isAnonymous: isAnon,
    decoupleLocationPin: isDecoupled,
    content: row.content,
    imageUrl: row.image_url || undefined,
    imageCaption: row.image_caption || undefined,
    isLead: row.is_lead,
    isPressRoll: row.is_press_roll,
    editionStyle: row.edition_style || undefined,
    sharingOption: row.sharing_option,
    parentDispatchId: row.parent_dispatch_id || undefined,
    sourceUrl: row.source_url || undefined,
    embedType: row.embed_type || undefined,
    embedData: row.embed_data || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FEED_PAGE_SIZE = 40;
const MAX_PAGE_SIZE = 100;

// Keyset (cursor) pagination helpers. A cursor is the opaque, base64-encoded
// {createdAt, id} of the last row on the previous page. Using created_at+id
// as the key (rather than OFFSET) keeps pages stable even as new dispatches
// are published in between page loads, and avoids the full-table cost of a
// growing OFFSET.
function encodeCursor(row) {
  return Buffer.from(JSON.stringify({ createdAt: row.created_at, id: row.id })).toString("base64url");
}

function decodeCursor(raw) {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof parsed?.createdAt !== "string" || typeof parsed?.id !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function parseLimit(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return FEED_PAGE_SIZE;
  return Math.min(n, MAX_PAGE_SIZE);
}

async function listOrFeed(req, res) {
  try {
    const wantsMine = req.query?.mine === "1" || req.query?.mine === "true";

    if (wantsMine) {
      const caller = await getAuthenticatedAccount(req);
      if (!caller) {
        res.status(401).json({ error: "Not authenticated." });
        return;
      }
      const rows = await sql`
        SELECT * FROM fieldpress_dispatches
        WHERE account_id = ${caller.id}
        ORDER BY created_at DESC;
      `;
      res.status(200).json({ dispatches: rows.map((r) => toClientShape(r, caller.id)) });
      return;
    }

    const limit = parseLimit(req.query?.limit);
    const cursor = decodeCursor(req.query?.cursor);

    // Server-side search (#153/#169), now itself cursor-paginated (#201) -
    // previously capped at a flat LIMIT 200, which silently dropped older
    // matches once a search term had more than 200 hits.
    const rawQuery = typeof req.query?.q === "string" ? req.query.q.trim() : "";
    if (rawQuery) {
      const like = `%${rawQuery}%`;
      const rows = cursor
        ? await sql`
            SELECT * FROM fieldpress_dispatches
            WHERE is_press_roll = false
              AND (
                title ILIKE ${like}
                OR content ILIKE ${like}
                OR location ILIKE ${like}
                OR author ILIKE ${like}
              )
              AND (created_at, id) < (${cursor.createdAt}, ${cursor.id})
            ORDER BY created_at DESC, id DESC
            LIMIT ${limit + 1};
          `
        : await sql`
            SELECT * FROM fieldpress_dispatches
            WHERE is_press_roll = false
              AND (
                title ILIKE ${like}
                OR content ILIKE ${like}
                OR location ILIKE ${like}
                OR author ILIKE ${like}
              )
            ORDER BY
              (title ILIKE ${like}) DESC,
              created_at DESC, id DESC
            LIMIT ${limit + 1};
          `;
      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;
      res.status(200).json({
        dispatches: page.map(toClientShape),
        nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
      });
      return;
    }

    // Public feed (#201) - cursor-paginated instead of a flat LIMIT 200, so
    // the feed keeps working (via "Load More") once dispatch volume grows
    // past a single page instead of silently truncating.
    const rows = cursor
      ? await sql`
          SELECT * FROM fieldpress_dispatches
          WHERE is_press_roll = false
            AND (created_at, id) < (${cursor.createdAt}, ${cursor.id})
          ORDER BY created_at DESC, id DESC
          LIMIT ${limit + 1};
        `
      : await sql`
          SELECT * FROM fieldpress_dispatches
          WHERE is_press_roll = false
          ORDER BY created_at DESC, id DESC
          LIMIT ${limit + 1};
        `;
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    res.status(200).json({
      dispatches: page.map(toClientShape),
      nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
    });
  } catch (err) {
    console.error("Dispatches list error:", err);
    res.status(500).json({ error: "Failed to load dispatches." });
  }
}

async function getOne(req, res, id) {
  try {
    const [row] = await sql`SELECT * FROM fieldpress_dispatches WHERE id = ${id} LIMIT 1;`;
    if (!row) {
      res.status(404).json({ error: "Dispatch not found." });
      return;
    }
    if (row.is_press_roll) {
      const caller = await getAuthenticatedAccount(req);
      if (!caller || caller.id !== row.account_id) {
        res.status(404).json({ error: "Dispatch not found." });
        return;
      }
    }
    res.status(200).json({ dispatch: toClientShape(row) });
  } catch (err) {
    console.error("Dispatch fetch error:", err);
    res.status(500).json({ error: "Failed to load dispatch." });
  }
}

async function create(req, res) {
  try {
    const caller = await getAuthenticatedAccount(req);
    if (!caller) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const {
      title, category, content, location, coordinates,
      imageUrl, imageCaption, isLead, isPressRoll, editionStyle,
      sharingOption, parentDispatchId, id: clientId, sourceUrl,
      isAnonymous, decoupleLocationPin, vicinityPinOnly
    } = req.body || {};

    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: "Title is required." });
      return;
    }
    if (typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Content is required." });
      return;
    }
    const cleanCategory = typeof category === "string" && category.trim() ? category.trim().slice(0, 100) : "Field Notes";
    const validSharing = new Set(["fork", "colab", "none"]);
    const cleanSharing = validSharing.has(sharingOption) ? sharingOption : "fork";

    const cleanSourceUrl = typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim().slice(0, 2000) : null;
    let embed = null;
    if (cleanSourceUrl) {
      embed = await resolveEmbed(cleanSourceUrl);
    }

    const id = typeof clientId === "string" && clientId.trim() ? clientId.trim().slice(0, 128) : `d-${Date.now()}-${caller.id.slice(-6)}`;
    const rawLat = Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
    const rawLng = Array.isArray(coordinates) && typeof coordinates[0] === "number" ? coordinates[0] : null;

    // Always fuzz to a ~5km vicinity sector (never store exact street/home GPS)
    const useVicinity = vicinityPinOnly !== false;
    const lat = rawLat != null ? (useVicinity ? fuzzVicinityCoord(rawLat, id + "lat") : rawLat) : null;
    const lng = rawLng != null ? (useVicinity ? fuzzVicinityCoord(rawLng, id + "lng") : rawLng) : null;

    const effectiveAuthor = isAnonymous ? "Anonymous Field Source" : caller.name;
    const effectiveCallsign = isAnonymous ? "anon-signal" : caller.callsign;
    const effectiveBureau = isAnonymous
      ? (decoupleLocationPin ? "Metadata Stripped • Pin Decoupled" : "Metadata Stripped • Vicinity Signal")
      : (decoupleLocationPin ? `${caller.bureau || "Field Bureau"} • Pin Decoupled` : caller.bureau);

    const rawLoc = (location || "").trim() || "Regional Sector";
    const effectiveLocation = useVicinity && !rawLoc.toLowerCase().includes("vicinity")
      ? `${rawLoc} (Vicinity)`
      : rawLoc;

    const [row] = await sql`
      INSERT INTO fieldpress_dispatches (
        id, account_id, title, category, author, callsign, bureau, location,
        latitude, longitude, content, image_url, image_caption, is_lead,
        is_press_roll, edition_style, sharing_option, parent_dispatch_id,
        source_url, embed_type, embed_data
      ) VALUES (
        ${id}, ${caller.id}, ${title.trim().slice(0, 500)}, ${cleanCategory},
        ${effectiveAuthor}, ${effectiveCallsign}, ${effectiveBureau}, ${effectiveLocation},
        ${lat}, ${lng}, ${content.trim()}, ${imageUrl || null}, ${imageCaption || null},
        ${!!isLead}, ${!!isPressRoll}, ${editionStyle || null}, ${cleanSharing},
        ${parentDispatchId || null}, ${cleanSourceUrl}, ${embed?.embed_type || null},
        ${embed?.embed_data ? JSON.stringify(embed.embed_data) : null}
      )
      ON CONFLICT (id) DO UPDATE SET
        author = EXCLUDED.author,
        callsign = EXCLUDED.callsign,
        bureau = EXCLUDED.bureau,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        location = EXCLUDED.location,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        content = EXCLUDED.content,
        image_url = EXCLUDED.image_url,
        image_caption = EXCLUDED.image_caption,
        is_lead = EXCLUDED.is_lead,
        is_press_roll = EXCLUDED.is_press_roll,
        edition_style = EXCLUDED.edition_style,
        sharing_option = EXCLUDED.sharing_option,
        source_url = EXCLUDED.source_url,
        embed_type = EXCLUDED.embed_type,
        embed_data = EXCLUDED.embed_data,
        updated_at = now()
      WHERE fieldpress_dispatches.account_id = ${caller.id}
      RETURNING *;
    `;

    if (!row) {
      res.status(403).json({ error: "You don't own this dispatch." });
      return;
    }

    res.status(201).json({ dispatch: toClientShape(row, caller.id) });
  } catch (err) {
    console.error("Dispatch create error:", err);
    res.status(500).json({ error: "Failed to save dispatch." });
  }
}

async function update(req, res, id) {
  try {
    const caller = await getAuthenticatedAccount(req);
    if (!caller) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const {
      title, category, content, location, coordinates,
      imageUrl, imageCaption, isLead, isPressRoll, editionStyle, sharingOption,
      sourceUrl, isAnonymous, decoupleLocationPin, vicinityPinOnly
    } = req.body || {};

    const validSharing = new Set(["fork", "colab", "none"]);
    const rawLat = Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
    const rawLng = Array.isArray(coordinates) && typeof coordinates[0] === "number" ? coordinates[0] : null;
    const useVicinity = vicinityPinOnly !== false;
    const lat = rawLat != null ? (useVicinity ? fuzzVicinityCoord(rawLat, id + "lat") : rawLat) : null;
    const lng = rawLng != null ? (useVicinity ? fuzzVicinityCoord(rawLng, id + "lng") : rawLng) : null;

    const effectiveAuthor = isAnonymous ? "Anonymous Field Source" : caller.name;
    const effectiveCallsign = isAnonymous ? "anon-signal" : caller.callsign;
    const effectiveBureau = isAnonymous
      ? (decoupleLocationPin ? "Metadata Stripped • Pin Decoupled" : "Metadata Stripped • Vicinity Signal")
      : (decoupleLocationPin ? `${caller.bureau || "Field Bureau"} • Pin Decoupled` : caller.bureau);

    const rawLoc = (location || "").trim() || "Regional Sector";
    const effectiveLocation = useVicinity && !rawLoc.toLowerCase().includes("vicinity")
      ? `${rawLoc} (Vicinity)`
      : rawLoc;

    const cleanSourceUrl = typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim().slice(0, 2000) : null;

    const [existing] = await sql`
      SELECT source_url, embed_type, embed_data FROM fieldpress_dispatches
      WHERE id = ${id} AND account_id = ${caller.id}
    `;
    if (!existing) {
      res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
      return;
    }

    let embedType = existing.embed_type;
    let embedData = existing.embed_data;
    if (cleanSourceUrl !== existing.source_url) {
      if (!cleanSourceUrl) {
        embedType = null;
        embedData = null;
      } else {
        const embed = await resolveEmbed(cleanSourceUrl);
        embedType = embed?.embed_type || null;
        embedData = embed?.embed_data ? JSON.stringify(embed.embed_data) : null;
      }
    }

    const [row] = await sql`
      UPDATE fieldpress_dispatches SET
        author = ${effectiveAuthor},
        callsign = ${effectiveCallsign},
        bureau = ${effectiveBureau},
        title = COALESCE(${typeof title === "string" ? title.trim().slice(0, 500) : null}, title),
        category = COALESCE(${typeof category === "string" ? category.trim().slice(0, 100) : null}, category),
        location = ${effectiveLocation},
        latitude = ${lat},
        longitude = ${lng},
        content = COALESCE(${typeof content === "string" ? content.trim() : null}, content),
        image_url = ${imageUrl ?? null},
        image_caption = ${imageCaption ?? null},
        is_lead = COALESCE(${typeof isLead === "boolean" ? isLead : null}, is_lead),
        is_press_roll = COALESCE(${typeof isPressRoll === "boolean" ? isPressRoll : null}, is_press_roll),
        edition_style = ${editionStyle ?? null},
        sharing_option = COALESCE(${validSharing.has(sharingOption) ? sharingOption : null}, sharing_option),
        source_url = ${cleanSourceUrl},
        embed_type = ${embedType},
        embed_data = ${embedData},
        updated_at = now()
      WHERE id = ${id} AND account_id = ${caller.id}
      RETURNING *;
    `;

    if (!row) {
      res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
      return;
    }
    res.status(200).json({ dispatch: toClientShape(row, caller.id) });
  } catch (err) {
    console.error("Dispatch update error:", err);
    res.status(500).json({ error: "Failed to update dispatch." });
  }
}

async function remove(req, res, id) {
  try {
    const caller = await getAuthenticatedAccount(req);
    if (!caller) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const [row] = await sql`
      DELETE FROM fieldpress_dispatches
      WHERE id = ${id} AND account_id = ${caller.id}
      RETURNING id;
    `;
    if (!row) {
      res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
      return;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Dispatch delete error:", err);
    res.status(500).json({ error: "Failed to delete dispatch." });
  }
}

export default async function handler(req, res) {
  const rawId = req.query?.id;
  const id = typeof rawId === "string" && rawId.trim() ? rawId.trim() : null;

  if (id) {
    if (req.method === "GET") return getOne(req, res, id);
    if (req.method === "PUT") return update(req, res, id);
    if (req.method === "DELETE") return remove(req, res, id);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (req.method === "GET") return listOrFeed(req, res);
  if (req.method === "POST") return create(req, res);
  res.status(405).json({ error: "Method not allowed" });
}
