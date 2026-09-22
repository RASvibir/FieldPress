// Resolves a URL into safe, cacheable embed metadata for rendering inside
// a pressie card. Only known providers with an official oEmbed endpoint
// get an iframe; everything else falls back to a static Open Graph link
// card. Never fetches or renders arbitrary third-party iframe HTML.
//
// Called server-side only (wire sync in api/feeds.mjs, and regular pressie
// submit in api/dispatches.mjs create()), never client-side per-render —
// result is cached in fieldpress_dispatches.embed_type/.embed_data so
// viewing a pressie never triggers a network call to the source or provider.
//
// SECURITY: resolveLinkCard() and canonicalize() fetch a URL that can
// originate from user input (a regular pressie's sourceUrl), so both are
// gated by assertSafeUrl() (see safeUrl.mjs) to block loopback/private/
// link-local targets, including on the post-redirect address. The oEmbed
// helpers (youtube/reddit/x) are NOT gated — they always fetch a fixed,
// trusted provider domain; the caller-supplied url is only ever passed as
// an encoded query param, never as the fetch target itself.

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/i;
const REDDIT_RE = /reddit\.com\/r\/[\w]+\/comments\/[\w]+/i;
const X_RE = /(?:x\.com|twitter\.com)\/\w+\/status\/\d+/i;

import assertSafeUrl from "./safeUrl.mjs";

const FETCH_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB cap on scraped OG pages

function decodeHtmlEntities(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function resolveYoutube(url) {
  try {
    const res = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      embed_type: "youtube",
      embed_data: {
        html: data.html,
        thumbnail_url: data.thumbnail_url,
        title: decodeHtmlEntities(data.title),
        provider_name: "YouTube"
      }
    };
  } catch {
    return null;
  }
}

async function resolveReddit(url) {
  try {
    const res = await fetchWithTimeout(
      `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      embed_type: "reddit",
      embed_data: {
        html: data.html,
        thumbnail_url: data.thumbnail_url || null,
        title: decodeHtmlEntities(data.title),
        provider_name: "Reddit"
      }
    };
  } catch {
    return null;
  }
}

async function resolveX(url) {
  try {
    const res = await fetchWithTimeout(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      embed_type: "x",
      embed_data: {
        html: data.html,
        thumbnail_url: null,
        title: data.author_name ? `Post by ${data.author_name}` : "Post on X",
        provider_name: "X"
      }
    };
  } catch {
    return null;
  }
}

// Generic Open Graph scrape -> static link card (no iframe). Used for
// Facebook (no open oEmbed anymore), Instagram, news sites, everything else.
async function resolveLinkCard(url) {
  const safe = await assertSafeUrl(url);
  if (!safe) return null;
  try {
    const res = await fetchWithTimeout(safe, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FieldPressBot/1.0; +https://fieldpress.studio)" },
      redirect: "follow"
    });
    if (!res.ok) return null;
    if (res.url && res.url !== safe && !(await assertSafeUrl(res.url))) return null;

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) return null;

    let html;
    if (res.body) {
      const chunks = [];
      let total = 0;
      for await (const chunk of res.body) {
        total += chunk.length;
        if (total > MAX_BODY_BYTES) { html = null; break; }
        chunks.push(chunk);
      }
      html = html === null ? null : Buffer.concat(chunks).toString("utf8");
    } else {
      html = await res.text();
    }
    if (html == null) return null;

    const grab = (prop) => {
      const m = html.match(
        new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i")
      ) || html.match(
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${prop}["']`, "i")
      );
      return m ? m[1].replace(/&amp;/g, "&") : null;
    };

    const title = grab("og:title");
    const image = grab("og:image");
    const siteName = grab("og:site_name");

    if (!title && !image) return null;

    return {
      embed_type: "link_card",
      embed_data: {
        html: null,
        thumbnail_url: image || null,
        title: title || url,
        provider_name: siteName || new URL(url).hostname.replace(/^www\./, "")
      }
    };
  } catch {
    return null;
  }
}

// Reddit share shortlinks (reddit.com/r/x/s/xxxxx) and redd.it links
// redirect to the canonical /comments/ URL — resolve that first so the
// pattern match below actually fires, instead of silently falling
// through to the generic scraper (which Reddit blocks with a JS wall).
async function canonicalize(url) {
  const safe = await assertSafeUrl(url);
  if (!safe) return url;
  try {
    const res = await fetchWithTimeout(safe, { redirect: "follow" });
    if (res.url && (await assertSafeUrl(res.url))) return res.url;
    return safe;
  } catch {
    return url;
  }
}

// Returns { embed_type, embed_data } or null if nothing could be resolved
// (e.g. the URL is unreachable, or has no OG metadata at all).
export default async function resolveEmbed(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;

  let resolvedUrl = url;
  if (/reddit\.com\/r\/[\w]+\/s\/|redd\.it\//i.test(url)) {
    resolvedUrl = await canonicalize(url);
  }

  if (YOUTUBE_RE.test(resolvedUrl)) {
    const r = await resolveYoutube(resolvedUrl);
    if (r) return r;
  }
  if (REDDIT_RE.test(resolvedUrl)) {
    const r = await resolveReddit(resolvedUrl);
    if (r) return r;
  }
  if (X_RE.test(resolvedUrl)) {
    const r = await resolveX(resolvedUrl);
    if (r) return r;
  }
  return resolveLinkCard(resolvedUrl);
}
