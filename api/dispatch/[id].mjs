// Serves a small HTML page with accurate Open Graph / Twitter Card meta
// tags for a single dispatch, so link-based shares (Facebook, X, Bluesky,
// Reddit, WhatsApp, Telegram, LinkedIn, Slack, Discord previews) show real
// title/description/image instead of nothing.
//
// IMPORTANT: real browsers get an actual HTTP 302 to the SPA route before
// any HTML is written. Only known crawler user-agents fall through to the
// OG-tagged HTML below, and that HTML never contains a meta-refresh or JS
// redirect. Facebook's crawler (and others) treat <meta http-equiv="refresh">
// as a real redirect to follow, so a page that both declared correct OG
// tags AND included a refresh tag was self-sabotaging: crawlers would hop
// straight to the plain SPA shell (generic static tags) and scrape that
// instead of this page. See PR for the debugging trail (Sharing Debugger's
// "Redirect Path" showed Input URL -> http-equiv=refresh -> og:url).
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

// Known social/link-preview crawler user-agent substrings. These bots
// (unlike real browsers) treat <meta http-equiv="refresh"> as an actual
// redirect to follow -- which previously sent them straight to the plain
// SPA shell (generic static OG tags) instead of reading the accurate
// per-dispatch tags on *this* page. So crawlers must NEVER see a refresh
// or JS redirect here; only real browsers get bounced onward.
const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "facebookcatalog",
  "Facebot",
  "Twitterbot",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
  "WhatsApp",
  "LinkedInBot",
  "redditbot",
  "Pinterest",
  "SkypeUriPreview",
  "Google-PageRenderer",
  "GoogleImageProxy",
  "Applebot",
  "bot",
  "crawler",
  "spider",
  "preview"
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((token) => ua.includes(token.toLowerCase()));
}

function renderPage({ title, description, image, spaUrl, canonicalUrl, redirectForHumans }) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  const url = escapeHtml(canonicalUrl);
  const redirect = escapeHtml(spaUrl);

  // Crawlers stop right here and read the tags below. Only human browsers
  // (redirectForHumans === true) get a client-side nudge onward -- and even
  // then, the real redirect for humans happens via a server-side 302 before
  // this HTML is ever sent (see handler), so this is just a no-JS fallback.
  const humanRedirectTags = redirectForHumans
    ? `
  <meta http-equiv="refresh" content="0; url=${redirect}" />
  <script>window.location.replace(${JSON.stringify(redirect)});</script>`
    : "";

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
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="675" />
  <meta property="og:image:alt" content="${t}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="FieldPress" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${img}" />${humanRedirectTags}
</head>
<body>
  <p><a href="${redirect}">Continue to FieldPress</a></p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const id = req.query?.id;
  const spaUrl = id ? `${SITE_ORIGIN}/#dispatch-${id}` : SITE_ORIGIN;
  const canonicalUrl = `${SITE_ORIGIN}/api/dispatch/${id || ""}`;
  const userAgent = req.headers?.["user-agent"] || "";
  const bot = isCrawler(userAgent);

  // Real browsers: skip straight to the SPA with a genuine HTTP redirect.
  // This is both more reliable than a meta-refresh and, critically, means
  // crawlers (which take a different path below) are the only ones who
  // ever see the OG-tagged HTML at all.
  // The edge/CDN cache is keyed per-URL and does NOT vary by User-Agent by
  // default, so a crawler-served response (below) and a human-served 302
  // (above) would otherwise clobber each other for the same URL within the
  // cache window -- whichever request happened to populate the cache wins
  // for everyone else until it expires. Vary: User-Agent forces the CDN to
  // cache crawler and human responses separately.
  res.setHeader("Vary", "User-Agent");

  if (!bot && id) {
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(302, { Location: spaUrl });
    res.end();
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

  if (!id) {
    res.status(400).send(
      renderPage({
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        image: FALLBACK_IMAGE,
        spaUrl: SITE_ORIGIN,
        canonicalUrl: SITE_ORIGIN,
        redirectForHumans: !bot
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
          canonicalUrl,
          redirectForHumans: !bot
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
        canonicalUrl,
        redirectForHumans: !bot
      })
    );
  } catch (err) {
    res.status(200).send(
      renderPage({
        title: FALLBACK_TITLE,
        description: FALLBACK_DESCRIPTION,
        image: FALLBACK_IMAGE,
        spaUrl,
        canonicalUrl,
        redirectForHumans: !bot
      })
    );
  }
}
