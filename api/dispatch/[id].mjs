// Serves a small HTML page with accurate Open Graph / Twitter Card meta
// tags for a single dispatch, so link-based shares (Facebook, X, Bluesky,
// Reddit, WhatsApp, Telegram, LinkedIn, Slack, Discord previews) show real
// title/description/image instead of nothing. Human visitors are bounced
// straight to the real SPA route via a meta-refresh + JS redirect; crawlers
// just read the meta tags and never execute the redirect.
//
// This is a stopgap that renders from a small synced metadata table
// (dispatch_share_meta), not a full per-dispatch rendered card image —
// see PR description for the known image-fidelity gap.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const SITE_ORIGIN = "https://fieldpress.studio";
const FALLBACK_IMAGE = `${SITE_ORIGIN}/pressyo-icon.jpg`;
const FALLBACK_TITLE = "FieldPress • Autonomous Field Bureau & Wire";
const FALLBACK_DESCRIPTION = "Hyperlocal citizen-journalism dispatches, styled by edition.";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderPage({ title, description, image, spaUrl, canonicalUrl }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  const url = escapeHtml(canonicalUrl);
  const redirect = escapeHtml(spaUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${t}</title>
  <meta name="description" content="${d}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="FieldPress" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />

  <meta http-equiv="refresh" content="0; url=${redirect}" />
  <script>window.location.replace(${JSON.stringify(redirect)});</script>
</head>
<body>
  <p>Redirecting to <a href="${redirect}">FieldPress</a>&hellip;</p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const id = req.query?.id;
  const spaUrl = id ? `${SITE_ORIGIN}/#dispatch-${id}` : SITE_ORIGIN;
  const canonicalUrl = `${SITE_ORIGIN}/api/dispatch/${id || ""}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

  if (!id) {
    res.status(400).send(
      renderPage({
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        image: FALLBACK_IMAGE,
        spaUrl: SITE_ORIGIN,
        canonicalUrl: SITE_ORIGIN
      })
    );
    return;
  }

  try {
    const rows = await sql`
      SELECT title, content_snippet, location, category, author, callsign, edition_style, image_url
      FROM dispatch_share_meta
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Not yet synced (never shared, or predates this system) — generic
      // fallback so the link still previews *something* rather than nothing.
      res.status(200).send(
        renderPage({
          title: FALLBACK_TITLE,
          description: FALLBACK_DESCRIPTION,
          image: FALLBACK_IMAGE,
          spaUrl,
          canonicalUrl
        })
      );
      return;
    }

    const row = rows[0];
    const title = `FieldPress: ${row.title}${row.location ? ` [${row.location}]` : ""}`;
    const descParts = [];
    if (row.category) descParts.push(row.category.toUpperCase());
    descParts.push(row.content_snippet);
    if (row.author) descParts.push(`— ${row.author}${row.callsign ? ` (@${row.callsign})` : ""}`);
    const description = descParts.join(" • ").slice(0, 300);

    res.status(200).send(
      renderPage({
        title,
        description,
        image: row.image_url || FALLBACK_IMAGE,
        spaUrl,
        canonicalUrl
      })
    );
  } catch (err) {
    res.status(200).send(
      renderPage({
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        image: FALLBACK_IMAGE,
        spaUrl,
        canonicalUrl
      })
    );
  }
}
