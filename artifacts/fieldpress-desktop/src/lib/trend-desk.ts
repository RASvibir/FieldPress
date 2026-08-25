export type TrendScale = "relatable" | "national" | "global";

export type TrendItem = {
  scale: TrendScale;
  headline: string;
  whyItMatters: string;
  productHook: string;
  source?: string;
};

export type TrendDesk = {
  whyNow: string;
  audience: string;
  summary: string;
  outline: string[];
  caption: string;
  trends: TrendItem[];
  searchedAt: string;
  trendQuery?: string;
  headlineCount?: number;
};

const STORAGE_PREFIX = "fieldpress.trendDesk.";

export function trendDeskKey(storyId: string) {
  return `${STORAGE_PREFIX}${storyId}`;
}

export function loadTrendDesk(storyId: string): TrendDesk | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(trendDeskKey(storyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrendDesk;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      whyNow: parsed.whyNow ?? "",
      audience: parsed.audience ?? "",
      summary: parsed.summary ?? "",
      outline: Array.isArray(parsed.outline) ? parsed.outline : [],
      caption: parsed.caption ?? "",
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      searchedAt: parsed.searchedAt ?? "",
      trendQuery: parsed.trendQuery,
      headlineCount: parsed.headlineCount,
    };
  } catch {
    return null;
  }
}

export function saveTrendDesk(storyId: string, desk: TrendDesk) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(trendDeskKey(storyId), JSON.stringify(desk));
}

export function deskFromProducePayload(payload: {
  summary?: string;
  outline?: string[];
  caption?: string;
  whyNow?: string;
  audience?: string;
  trends?: TrendItem[];
  trendQuery?: string;
  headlineCount?: number;
}): TrendDesk {
  return {
    whyNow: payload.whyNow ?? "",
    audience: payload.audience ?? "",
    summary: payload.summary ?? "",
    outline: payload.outline ?? [],
    caption: payload.caption ?? "",
    trends: payload.trends ?? [],
    searchedAt: new Date().toISOString(),
    trendQuery: payload.trendQuery,
    headlineCount: payload.headlineCount,
  };
}

export const SCALE_LABEL: Record<TrendScale, string> = {
  relatable: "RELATABLE",
  national: "NATIONAL",
  global: "GLOBAL",
};
