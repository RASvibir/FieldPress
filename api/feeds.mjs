// /api/feeds/* — inbound wire pressie sync.
//
//   GET  /api/feeds?action=sync   — pull all configured sources, upsert
//                                    new items as wire pressies (cron-only,
//                                    see vercel.json)
//   GET  /api/feeds?action=list   — list current wire pressies (debug)
//
// Wire pressies are ordinary fieldpress_dispatches rows: edition_style
// = 'wire', owned by the @wire system account, deduped by source link
// via source_url. Embed metadata (YouTube/Reddit/link-card) is resolved
// once here at ingest time and cached on the row.

import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";
import parseRss from "./_lib/parseRss.mjs";
import resolveEmbed from "./_lib/resolveEmbed.mjs";
import wireSources from "./_lib/wireSources.mjs";

const sql = neon(process.env.DATABASE_URL);
const WIRE_ACCOUNT_ID = "wire-system-account";

function clean(str, max) {
  if (typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

async function syncSource(source) {
  let inserted = 0;
  try {
    const res = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { source: source.name, ok: false, error: `HTTP ${res.status}` };
    const xml = await res.text();
    const items = parseRss(xml).slice(0, 20); // cap per-sync-run per source

    for (const item of items) {
      const existing = await sql`
        SELECT id FROM fieldpress_dispatches WHERE source_url = ${item.link} LIMIT 1
      `;
      if (existing.length > 0) continue;

      const embed = await resolveEmbed(item.link);
      const id = crypto.randomUUID();
      const title = clean(item.title, 300) || "Untitled";
      const content = clean(item.description, 5000) || title;
      const author = clean(source.name, 200) || "External Source";
      const callsign = "@wire";
      const bureau = clean(new URL(item.link).hostname.replace(/^www\./, ""), 200);
      const category = clean(source.category, 100) || "Wire";

      await sql`
        INSERT INTO fieldpress_dispatches
          (id, account_id, title, category, author, callsign, bureau, content,
           image_url, edition_style, sharing_option, source_url, embed_type, embed_data,
           created_at, updated_at)
        VALUES
          (${id}, ${WIRE_ACCOUNT_ID}, ${title}, ${category}, ${author}, ${callsign}, ${bureau}, ${content},
           ${embed?.embed_data?.thumbnail_url || null}, 'wire', 'fork', ${item.link},
           ${embed?.embed_type || null}, ${embed?.embed_data ? JSON.stringify(embed.embed_data) : null},
           ${item.pubDate || new Date()}, now())
      `;
      inserted++;
    }
    return { source: source.name, ok: true, inserted };
  } catch (err) {
    return { source: source.name, ok: false, error: err?.message || "Unknown error" };
  }
}

export default async function handler(req, res) {
  const action = req.query?.action;

  if (action === "sync") {
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    // Vercel cron requests carry `Authorization: Bearer $CRON_SECRET`
    // automatically. Without this check the endpoint is publicly
    // reachable by anyone, who could trigger unlimited real HTTP fetches
    // against every configured RSS source plus per-item embed resolution
    // on every hit.
    const expected = process.env.CRON_SECRET;
    const authHeader = req.headers?.authorization || "";
    if (!expected || authHeader !== `Bearer ${expected}`) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
    const results = [];
    for (const source of wireSources) {
      results.push(await syncSource(source));
    }
    res.status(200).json({ ok: true, results });
    return;
  }

  if (action === "list") {
    const rows = await sql`
      SELECT id, title, author, bureau, source_url, embed_type, created_at
      FROM fieldpress_dispatches
      WHERE edition_style = 'wire'
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.status(200).json({ ok: true, items: rows });
    return;
  }

  res.status(404).json({ error: "Unknown feeds action." });
}
