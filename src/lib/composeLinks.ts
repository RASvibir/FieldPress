import { IMBRGR_URL } from "../config/site";

const IMBRGR_HOST = new URL(IMBRGR_URL).hostname.toLowerCase();

/** Allowed https image hosts for ?compose=1&image= deep links (reference by URL only). */
const COMPOSE_IMAGE_HOSTS = new Set([IMBRGR_HOST, "imbrgr.vercel.app"]);

/**
 * Validates an incoming compose `image` query param.
 * Accepts direct file URLs (e.g. /api/media/file/...) — not /api/media/<id> JSON metadata.
 */
export function parseComposeImageParam(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  if (decoded.length > 2048) return null;

  let url: URL;
  try {
    url = new URL(decoded);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (!COMPOSE_IMAGE_HOSTS.has(host)) return null;

  const path = url.pathname.toLowerCase();
  // imbrgr JSON metadata endpoint — not a renderable image
  if (/^\/api\/media\/[^/]+$/.test(path) && !path.includes("/file/")) {
    return null;
  }

  return url.toString();
}

export function parseComposeTitleParam(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  try {
    const t = decodeURIComponent(raw.trim());
    return t.length > 500 ? t.slice(0, 500) : t;
  } catch {
    return "";
  }
}

/** Consumer-friendly imbrgr studio link with optional prompt from dispatch copy. */
export function buildImbrgrStudioUrl(prompt?: string | null): string {
  const base = `${IMBRGR_URL.replace(/\/+$/, "")}/studio?tab=generate`;
  const text = (prompt || "").trim();
  if (!text) return base;
  const clipped = text.length > 400 ? `${text.slice(0, 397)}…` : text;
  return `${base}&prompt=${encodeURIComponent(clipped)}`;
}

export function buildComposeDeepLink(imageUrl: string, title?: string): string {
  const origin = "https://fieldpress.studio";
  const params = new URLSearchParams();
  params.set("compose", "1");
  params.set("image", imageUrl);
  if (title?.trim()) params.set("title", title.trim().slice(0, 500));
  return `${origin}/?${params.toString()}`;
}
