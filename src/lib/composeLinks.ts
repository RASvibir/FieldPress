import { FIELDPRESS_PUBLIC_URL, IMBRGR_URL } from "../config/site";

/** Allowed https image hosts for ?compose=1&image= deep links (reference by URL only). */
export function isAllowedComposeImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "imbrgr.website" ||
    host === "www.imbrgr.website" ||
    host === "imbrgr.vercel.app"
  ) {
    return true;
  }
  try {
    if (host === new URL(IMBRGR_URL).hostname.toLowerCase()) return true;
  } catch {
    /* ignore */
  }
  // Preview deployments for the imbrgr Vercel project
  if (/^imbrgr-[a-z0-9-]+\.vercel\.app$/.test(host)) return true;
  return false;
}

/** Dispatch / press-roll ids from API (client or server generated). */
export const COMPOSE_DRAFT_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$/;

export function parseComposeDraftParam(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  if (!COMPOSE_DRAFT_ID_RE.test(decoded)) return null;
  return decoded;
}

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
  if (!isAllowedComposeImageHost(url.hostname)) return null;

  const path = url.pathname.toLowerCase();
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

export function suggestImagePromptFromPost(title?: string, content?: string): string {
  const head = (title || "").trim();
  const body = (content || "").trim().split(/\n/).slice(0, 3).join(" ").slice(0, 240);
  const combined = head && body ? `${head} — ${body}` : head || body;
  return combined.slice(0, 400);
}

/** Simple studio link (nav, no draft). */
export function buildImbrgrStudioUrl(prompt?: string | null): string {
  const base = `${IMBRGR_URL.replace(/\/+$/, "")}/studio?tab=generate`;
  const text = (prompt || "").trim();
  if (!text) return base;
  const clipped = text.length > 400 ? `${text.slice(0, 397)}…` : text;
  return `${base}&prompt=${encodeURIComponent(clipped)}`;
}

/** Embedded studio panel inside FieldPress compose (imbrgr should honor `embed=1` chrome). */
export function buildImbrgrEmbedUrl(opts: {
  prompt?: string | null;
  draftId?: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("tab", "generate");
  params.set("embed", "1");
  params.set("from", "fieldpress");
  const prompt = (opts.prompt || "").trim();
  if (prompt) {
    const clipped = prompt.length > 400 ? `${prompt.slice(0, 397)}…` : prompt;
    params.set("prompt", clipped);
  }
  if (opts.draftId && COMPOSE_DRAFT_ID_RE.test(opts.draftId)) {
    params.set("draft", opts.draftId);
  }
  return `${IMBRGR_URL.replace(/\/+$/, "")}/studio?${params.toString()}`;
}

/** After autosaving a draft, open imbrgr with return context. */
export function buildImbrgrCreateImageUrl(opts: {
  prompt?: string | null;
  draftId: string;
}): string {
  const params = new URLSearchParams();
  params.set("tab", "generate");
  const prompt = (opts.prompt || "").trim();
  if (prompt) {
    const clipped = prompt.length > 400 ? `${prompt.slice(0, 397)}…` : prompt;
    params.set("prompt", clipped);
  }
  params.set("from", "fieldpress");
  params.set("draft", opts.draftId);
  return `${IMBRGR_URL.replace(/\/+$/, "")}/studio?${params.toString()}`;
}

export function buildComposeDeepLink(opts: {
  imageUrl: string;
  title?: string;
  draftId?: string | null;
}): string {
  const origin = String(FIELDPRESS_PUBLIC_URL).replace(/\/+$/, "");
  const params = new URLSearchParams();
  params.set("compose", "1");
  params.set("image", opts.imageUrl);
  if (opts.title?.trim()) params.set("title", opts.title.trim().slice(0, 500));
  if (opts.draftId && COMPOSE_DRAFT_ID_RE.test(opts.draftId)) {
    params.set("draft", opts.draftId);
  }
  return `${origin}/?${params.toString()}`;
}
