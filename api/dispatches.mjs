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

const sql = neon(process.env.DATABASE_URL);

function toClientShape(row) {
  return {
    id: row.id,
    accountId: row.account_id,
    title: row.title,
    category: row.category,
    author: row.author,
    callsign: row.callsign,
    bureau: row.bureau,
    location: row.location || undefined,
    coordinates: row.latitude != null && row.longitude != null ? [row.longitude, row.latitude] : undefined,
    content: row.content,
    imageUrl: row.image_url || undefined,
    imageCaption: row.image_caption || undefined,
    isLead: row.is_lead,
    isPressRoll: row.is_press_roll,
    editionStyle: row.edition_style || undefined,
    sharingOption: row.sharing_option,
    parentDispatchId: row.parent_dispatch_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
      res.status(200).json({ dispatches: rows.map(toClientShape) });
      return;
    }

    const rows = await sql`
      SELECT * FROM fieldpress_dispatches
      WHERE is_press_roll = false
      ORDER BY created_at DESC
      LIMIT 200;
    `;
    res.status(200).json({ dispatches: rows.map(toClientShape) });
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
      sharingOption, parentDispatchId, id: clientId
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

    const id = typeof clientId === "string" && clientId.trim() ? clientId.trim().slice(0, 128) : `d-${Date.now()}-${caller.id.slice(-6)}`;
    const lat = Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
    const lng = Array.isArray(coordinates) && typeof coordinates[0] === "number" ? coordinates[0] : null;

    const [row] = await sql`
      INSERT INTO fieldpress_dispatches (
        id, account_id, title, category, author, callsign, bureau, location,
        latitude, longitude, content, image_url, image_caption, is_lead,
        is_press_roll, edition_style, sharing_option, parent_dispatch_id
      ) VALUES (
        ${id}, ${caller.id}, ${title.trim().slice(0, 500)}, ${cleanCategory},
        ${caller.name}, ${caller.callsign}, ${caller.bureau}, ${location || null},
        ${lat}, ${lng}, ${content.trim()}, ${imageUrl || null}, ${imageCaption || null},
        ${!!isLead}, ${!!isPressRoll}, ${editionStyle || null}, ${cleanSharing},
        ${parentDispatchId || null}
      )
      ON CONFLICT (id) DO UPDATE SET
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
        updated_at = now()
      WHERE fieldpress_dispatches.account_id = ${caller.id}
      RETURNING *;
    `;

    if (!row) {
      res.status(403).json({ error: "You don't own this dispatch." });
      return;
    }

    res.status(201).json({ dispatch: toClientShape(row) });
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
      imageUrl, imageCaption, isLead, isPressRoll, editionStyle, sharingOption
    } = req.body || {};

    const validSharing = new Set(["fork", "colab", "none"]);
    const lat = Array.isArray(coordinates) && typeof coordinates[1] === "number" ? coordinates[1] : null;
    const lng = Array.isArray(coordinates) && typeof coordinates[0] === "number" ? coordinates[0] : null;

    const [row] = await sql`
      UPDATE fieldpress_dispatches SET
        title = COALESCE(${typeof title === "string" ? title.trim().slice(0, 500) : null}, title),
        category = COALESCE(${typeof category === "string" ? category.trim().slice(0, 100) : null}, category),
        location = ${location ?? null},
        latitude = ${lat},
        longitude = ${lng},
        content = COALESCE(${typeof content === "string" ? content.trim() : null}, content),
        image_url = ${imageUrl ?? null},
        image_caption = ${imageCaption ?? null},
        is_lead = COALESCE(${typeof isLead === "boolean" ? isLead : null}, is_lead),
        is_press_roll = COALESCE(${typeof isPressRoll === "boolean" ? isPressRoll : null}, is_press_roll),
        edition_style = ${editionStyle ?? null},
        sharing_option = COALESCE(${validSharing.has(sharingOption) ? sharingOption : null}, sharing_option),
        updated_at = now()
      WHERE id = ${id} AND account_id = ${caller.id}
      RETURNING *;
    `;

    if (!row) {
      res.status(403).json({ error: "You don't own this dispatch, or it doesn't exist." });
      return;
    }
    res.status(200).json({ dispatch: toClientShape(row) });
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
