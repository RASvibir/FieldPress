// Resolves a URL into safe, cacheable embed metadata for rendering inside
// a pressie card and the Full-Page Pressie Reader.
// Supports:
//   - YouTube videos & shorts (oEmbed + iframe)
//   - Facebook Reels, Watch & Videos (/share/r/, /share/v/, /reel/, /videos/, /watch, fb.watch)
//     -> Extracts direct playable progressive MP4 streams (hd_src / sd_src) AND official Facebook Video Plugin iframe
//   - Instagram Reels & Posts (/reel/, /p/, /tv/ -> official Instagram embed iframe)
//   - TikTok Videos (oEmbed + official TikTok v2 embed player)
//   - Vimeo Videos (oEmbed + player.vimeo.com iframe)
//   - Reddit & X/Twitter posts (oEmbed)
//   - Generic Open Graph articles & direct og:video / .mp4 streams

import assertSafeUrl from "./safeUrl.mjs";

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/i;
const REDDIT_RE = /reddit\.com\/r\/[\w]+\/comments\/[\w]+/i;
const X_RE = /(?:x\.com|twitter\.com)\/\w+\/status\/\d+/i;
const FACEBOOK_VIDEO_RE = /(?:facebook\.com\/(?:share\/[rv]\/|reel\/|watch\/?(?:\?v=)?|[\w.]+\/videos\/)|fb\.watch\/)/i;
const INSTAGRAM_RE = /instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/i;
const TIKTOK_RE = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/i;
const VIMEO_RE = /vimeo\.com\/(\d+)/i;
const DIRECT_VIDEO_RE = /\.(?:mp4|webm|mov)(?:\?.*)?$/i;

const FETCH_TIMEOUT_MS = 6500;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB cap on scraped OG pages

export function decodeHtmlEntities(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return _;
      }
    })
    .replace(/&#0*(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return _;
      }
    })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
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
    const m = url.match(YOUTUBE_RE);
    const videoId = m ? m[1] : null;
    const res = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const iframeUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    return {
      embed_type: "youtube",
      embed_data: {
        html: data.html,
        iframe_url: iframeUrl,
        thumbnail_url: data.thumbnail_url,
        title: decodeHtmlEntities(data.title),
        provider_name: "YouTube",
        url
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
        provider_name: "Reddit",
        url
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
        title: data.author_name ? `Post by ${decodeHtmlEntities(data.author_name)}` : "Post on X",
        provider_name: "X",
        url
      }
    };
  } catch {
    return null;
  }
}

// Extracts direct progressive MP4 streams (hd_src / sd_src) and official
// Facebook Video Plugin iframe for any Facebook Reel, Watch, or Video link.
async function resolveFacebookVideo(targetUrl, ogMeta = {}) {
  try {
    let canonicalVideoUrl = ogMeta.ogUrl || targetUrl;
    let title = ogMeta.title || null;
    let description = ogMeta.description || null;
    let image = ogMeta.image || null;

    // If we haven't scraped the target URL yet, follow redirects to get og:url / og:title / og:image
    if (!ogMeta.scraped) {
      const safe = await assertSafeUrl(targetUrl);
      if (safe) {
        const pageRes = await fetchWithTimeout(safe, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; FieldPressBot/1.0; +https://fieldpress.studio)"
          },
          redirect: "follow"
        });
        if (pageRes.ok) {
          if (pageRes.url && (await assertSafeUrl(pageRes.url))) {
            canonicalVideoUrl = pageRes.url;
          }
          const html = await pageRes.text();
          const grab = (prop) => {
            const m =
              html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i")) ||
              html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${prop}["']`, "i"));
            return m ? decodeHtmlEntities(m[1]) : null;
          };
          const scrapedOgUrl = grab("og:url");
          if (scrapedOgUrl && /^https?:\/\/(www\.)?facebook\.com\//i.test(scrapedOgUrl)) {
            canonicalVideoUrl = scrapedOgUrl;
          }
          title = title || grab("og:title");
          description = description || grab("og:description");
          image = image || grab("og:image");
        }
      }
    }

    const pluginUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(canonicalVideoUrl)}&show_text=false`;
    let hdSrc = null;
    let sdSrc = null;

    try {
      const pluginRes = await fetchWithTimeout(pluginUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
      });
      if (pluginRes.ok) {
        const pluginHtml = await pluginRes.text();
        const extractJsonStr = (key) => {
          const m = pluginHtml.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
          if (!m) return null;
          try {
            return JSON.parse(`"${m[1]}"`);
          } catch {
            return m[1].replace(/\\\//g, "/");
          }
        };
        hdSrc = extractJsonStr("hd_src") || extractJsonStr("browser_native_hd_url") || extractJsonStr("playable_url_quality_hd");
        sdSrc = extractJsonStr("sd_src") || extractJsonStr("browser_native_sd_url") || extractJsonStr("playable_url");
      }
    } catch {
      // Plugin scrape is best-effort; iframe fallback still works
    }

    const videoUrl = hdSrc || sdSrc || ogMeta.videoUrl || null;
    const iframeHtml = `<iframe src="${pluginUrl}" width="100%" height="100%" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;

    return {
      embed_type: "facebook_video",
      embed_data: {
        html: iframeHtml,
        iframe_url: pluginUrl,
        video_url: videoUrl,
        hd_video_url: hdSrc || null,
        sd_video_url: sdSrc || null,
        thumbnail_url: image || null,
        title: decodeHtmlEntities(title || "Facebook Video Dispatch"),
        description: decodeHtmlEntities(description || ""),
        url: canonicalVideoUrl,
        provider_name: "Facebook Reel / Video"
      }
    };
  } catch {
    return null;
  }
}

async function resolveInstagram(url) {
  const m = url.match(INSTAGRAM_RE);
  if (!m) return null;
  const shortcode = m[1];
  const iframeUrl = `https://www.instagram.com/p/${shortcode}/embed/`;
  const iframeHtml = `<iframe src="${iframeUrl}" width="100%" height="560" frameborder="0" scrolling="no" allowtransparency="true" allow="encrypted-media"></iframe>`;
  return {
    embed_type: "instagram",
    embed_data: {
      html: iframeHtml,
      iframe_url: iframeUrl,
      thumbnail_url: null,
      title: `Instagram Reel / Post (${shortcode})`,
      provider_name: "Instagram",
      url
    }
  };
}

async function resolveTikTok(url) {
  const m = url.match(TIKTOK_RE);
  const videoId = m ? m[1] : null;
  try {
    const res = await fetchWithTimeout(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    const data = res.ok ? await res.json() : null;
    const iframeUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null;
    const iframeHtml = iframeUrl
      ? `<iframe src="${iframeUrl}" width="100%" height="580" frameborder="0" allow="autoplay; encrypted-media;" allowfullscreen></iframe>`
      : data?.html || null;
    return {
      embed_type: "tiktok",
      embed_data: {
        html: iframeHtml,
        iframe_url: iframeUrl,
        thumbnail_url: data?.thumbnail_url || null,
        title: decodeHtmlEntities(data?.title || "TikTok Video Dispatch"),
        provider_name: "TikTok",
        url
      }
    };
  } catch {
    return null;
  }
}

async function resolveVimeo(url) {
  const m = url.match(VIMEO_RE);
  if (!m) return null;
  const videoId = m[1];
  const iframeUrl = `https://player.vimeo.com/video/${videoId}`;
  const iframeHtml = `<iframe src="${iframeUrl}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  return {
    embed_type: "vimeo",
    embed_data: {
      html: iframeHtml,
      iframe_url: iframeUrl,
      thumbnail_url: null,
      title: `Vimeo Video #${videoId}`,
      provider_name: "Vimeo",
      url
    }
  };
}

// Generic Open Graph scrape -> detects embedded video streams (og:video / Facebook video) or falls back to link_card
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

    const finalUrl = res.url || safe;
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
        new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*)["']`, "i")
      ) || html.match(
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${prop}["']`, "i")
      );
      return m ? decodeHtmlEntities(m[1]) : null;
    };

    const title = grab("og:title") || grab("twitter:title");
    const description = grab("og:description") || grab("twitter:description") || grab("description");
    const image = grab("og:image") || grab("twitter:image");
    const siteName = grab("og:site_name");
    const ogType = grab("og:type") || "";
    const ogUrl = grab("og:url") || finalUrl;
    const ogVideo = grab("og:video:secure_url") || grab("og:video:url") || grab("og:video");

    // If this page redirected to or is a Facebook Video / Reel, resolve its actual video stream & player!
    if (
      FACEBOOK_VIDEO_RE.test(finalUrl) ||
      FACEBOOK_VIDEO_RE.test(ogUrl) ||
      (/facebook\.com/i.test(finalUrl) && ogType.toLowerCase().startsWith("video"))
    ) {
      const fbResolved = await resolveFacebookVideo(finalUrl, {
        scraped: true,
        ogUrl,
        title,
        description,
        image,
        videoUrl: ogVideo
      });
      if (fbResolved) return fbResolved;
    }

    if (!title && !image && !ogVideo) return null;

    const providerName = siteName || new URL(finalUrl).hostname.replace(/^www\./, "");
    const isStreamingPlatform =
      /(?:^|\.)(?:tubitv\.com|netflix\.com|hulu\.com|max\.com|primevideo\.com|peacocktv\.com|pluto\.tv|plex\.tv|therokuchannel\.roku\.com|imdb\.com|letterboxd\.com)$/i.test(
        new URL(finalUrl).hostname
      ) || /^video\.(?:movie|tv_show|episode)/i.test(ogType);

    let trailerVideoId = null;
    if (!ogVideo && isStreamingPlatform && title) {
      try {
        const cleanTitle = decodeHtmlEntities(title)
          .replace(/\s*\|\s*Watch Free.*$/i, "")
          .replace(/\s*-\s*Tubi.*$/i, "")
          .trim();
        const searchQuery = encodeURIComponent(`${cleanTitle} ${siteName || ""} official movie trailer`.trim());
        const ytRes = await fetchWithTimeout(`https://www.youtube.com/results?search_query=${searchQuery}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
          }
        });
        if (ytRes.ok) {
          const ytHtml = await ytRes.text();
          const vidMatch = ytHtml.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (vidMatch) {
            trailerVideoId = vidMatch[1];
          }
        }
      } catch {
        // Best-effort trailer lookup
      }
    }

    const iframeUrl = trailerVideoId ? `https://www.youtube.com/embed/${trailerVideoId}` : null;

    return {
      embed_type: ogVideo ? "video" : trailerVideoId ? "streaming_video" : "link_card",
      embed_data: {
        html: iframeUrl
          ? `<iframe src="${iframeUrl}" width="100%" height="380" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`
          : null,
        iframe_url: iframeUrl,
        trailer_video_id: trailerVideoId,
        video_url: ogVideo || null,
        thumbnail_url: image || null,
        image: image || null,
        title: decodeHtmlEntities(title || url),
        description: decodeHtmlEntities(description || ""),
        url: ogUrl,
        site_name: providerName,
        provider_name: providerName
      }
    };
  } catch {
    return null;
  }
}

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

export default async function resolveEmbed(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(parsed.protocol)) return null;

  if (DIRECT_VIDEO_RE.test(url)) {
    return {
      embed_type: "video",
      embed_data: {
        html: null,
        video_url: url,
        thumbnail_url: null,
        title: "Direct Field Video Stream",
        provider_name: parsed.hostname.replace(/^www\./, ""),
        url
      }
    };
  }

  let resolvedUrl = url;
  if (/reddit\.com\/r\/[\w]+\/s\/|redd\.it\//i.test(url)) {
    resolvedUrl = await canonicalize(url);
  }

  if (YOUTUBE_RE.test(resolvedUrl)) {
    const r = await resolveYoutube(resolvedUrl);
    if (r) return r;
  }
  if (FACEBOOK_VIDEO_RE.test(resolvedUrl)) {
    const r = await resolveFacebookVideo(resolvedUrl);
    if (r) return r;
  }
  if (INSTAGRAM_RE.test(resolvedUrl)) {
    const r = await resolveInstagram(resolvedUrl);
    if (r) return r;
  }
  if (TIKTOK_RE.test(resolvedUrl)) {
    const r = await resolveTikTok(resolvedUrl);
    if (r) return r;
  }
  if (VIMEO_RE.test(resolvedUrl)) {
    const r = await resolveVimeo(resolvedUrl);
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
