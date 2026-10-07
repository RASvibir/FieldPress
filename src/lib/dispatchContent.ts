const SHARED_VIA_RE = /^Shared Dispatch via\s+/i;

export function normalizeDispatchBody(content?: string | null): string {
  return (content || "").replace(/\s+/g, " ").trim();
}

/** Thin wire shares (link-only stubs) get a clearer empty-state line in the UI. */
export function dispatchBodyDisplay(
  content?: string | null,
  sourceUrl?: string | null
): { body: string; isLinkStub: boolean } {
  const raw = normalizeDispatchBody(content);
  const isLinkStub = !raw || SHARED_VIA_RE.test(raw) || (raw.length < 48 && Boolean(sourceUrl));
  if (raw && !SHARED_VIA_RE.test(raw)) {
    return { body: raw, isLinkStub: false };
  }
  if (sourceUrl) {
    try {
      const host = new URL(sourceUrl).hostname.replace(/^www\./i, "");
      return {
        body: `This dispatch links to a story on ${host}. Open the source or embed below for the full piece.`,
        isLinkStub: true
      };
    } catch {
      return { body: "This dispatch links to an external source — see below.", isLinkStub: true };
    }
  }
  return { body: raw || "No body filed yet.", isLinkStub: !raw };
}
