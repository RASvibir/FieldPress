// Upserts the minimal metadata needed to render accurate Open Graph tags
// for a dispatch when it's shared. Called client-side right when the share
// modal opens, so any dispatch that's ever actually shared becomes visible
// to link-preview crawlers server-side (localStorage-only data otherwise
// never reaches the server at all).

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

function clean(str, max) {
  if (typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const id = clean(body.id, 128);
    const title = clean(body.title, 300);
    const contentSnippet = clean(body.content, 500);

    if (!id || !title || !contentSnippet) {
      res.status(400).json({ error: "Missing required fields: id, title, content" });
      return;
    }

    const location = clean(body.location, 200);
    const category = clean(body.category, 100);
    const author = clean(body.author, 200);
    const callsign = clean(body.callsign, 100);
    const editionStyle = clean(body.editionStyle, 50) || "newspaper";
    const imageUrl = clean(body.imageUrl, 2000);

    await sql`
      INSERT INTO dispatch_share_meta
        (id, title, content_snippet, location, category, author, callsign, edition_style, image_url, updated_at)
      VALUES
        (${id}, ${title}, ${contentSnippet}, ${location}, ${category}, ${author}, ${callsign}, ${editionStyle}, ${imageUrl}, now())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content_snippet = EXCLUDED.content_snippet,
        location = EXCLUDED.location,
        category = EXCLUDED.category,
        author = EXCLUDED.author,
        callsign = EXCLUDED.callsign,
        edition_style = EXCLUDED.edition_style,
        image_url = EXCLUDED.image_url,
        updated_at = now();
    `;

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}
