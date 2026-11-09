import { IMBRGR_URL } from "../config/site";
import { parseComposeDraftParam, parseComposeImageParam, parseComposeTitleParam } from "./composeLinks";

/** Must match imbrgr `IMBRGR_COMPOSE_MESSAGE_TYPE`. */
export const IMBRGR_COMPOSE_MESSAGE_TYPE = "imbrgr:compose-image";

export type ImbrgrComposeMessage = {
  type: typeof IMBRGR_COMPOSE_MESSAGE_TYPE;
  imageUrl: string;
  draftId?: string | null;
  title?: string | null;
};

function imbrgrAllowedOrigins(): Set<string> {
  const origins = new Set<string>();
  try {
    origins.add(new URL(IMBRGR_URL).origin);
  } catch {
    /* ignore */
  }
  origins.add("https://imbrgr.website");
  origins.add("https://www.imbrgr.website");
  origins.add("https://imbrgr.vercel.app");
  return origins;
}

function trustImbrgrVercelPreviews(): boolean {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env?.VITE_IMBRGR_TRUST_PREVIEWS === "1";
  } catch {
    return false;
  }
}

export function isTrustedImbrgrOrigin(origin: string): boolean {
  if (imbrgrAllowedOrigins().has(origin)) return true;
  // Opt-in only — preview hostnames are guessable / creatable by third parties.
  if (!trustImbrgrVercelPreviews()) return false;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return /^imbrgr-[a-z0-9-]+\.vercel\.app$/.test(host);
  } catch {
    return false;
  }
}

/** Validate a window message from embedded imbrgr studio. */
export function parseImbrgrComposeMessage(
  origin: string,
  data: unknown,
): { imageUrl: string; draftId: string | null; title: string } | null {
  if (!isTrustedImbrgrOrigin(origin)) return null;
  if (!data || typeof data !== "object") return null;
  const msg = data as Record<string, unknown>;
  if (msg.type !== IMBRGR_COMPOSE_MESSAGE_TYPE) return null;
  const imageUrl = parseComposeImageParam(typeof msg.imageUrl === "string" ? msg.imageUrl : null);
  if (!imageUrl) return null;
  const draftId = parseComposeDraftParam(typeof msg.draftId === "string" ? msg.draftId : null);
  const title = parseComposeTitleParam(typeof msg.title === "string" ? msg.title : "");
  return { imageUrl, draftId, title };
}
