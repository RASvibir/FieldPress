const PREFIX = "fp_headline_cache:";

export type CachedHeadline = {
  text: string;
  savedAt: string;
};

export function loadHeadlineCache(storyId: string): CachedHeadline[] {
  try {
    const raw = localStorage.getItem(PREFIX + storyId);
    return raw ? (JSON.parse(raw) as CachedHeadline[]) : [];
  } catch {
    return [];
  }
}

export function saveHeadlineCache(storyId: string, headlines: string[]): CachedHeadline[] {
  const existing = loadHeadlineCache(storyId);
  const seen = new Set(existing.map((item) => item.text));
  const next = [...existing];
  const now = new Date().toISOString();
  for (const text of headlines) {
    const trimmed = text.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    next.unshift({ text: trimmed, savedAt: now });
  }
  const sliced = next.slice(0, 24);
  localStorage.setItem(PREFIX + storyId, JSON.stringify(sliced));
  return sliced;
}
