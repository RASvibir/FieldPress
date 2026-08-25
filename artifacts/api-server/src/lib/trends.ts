import { logger } from "./logger";

export type TrendScale = "relatable" | "national" | "global";

export type PublicHeadline = {
  scale: TrendScale;
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
};

export type PublicTrendBrief = {
  fetchedAt: string;
  query: string;
  headlines: PublicHeadline[];
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; FieldPress/1.0; +https://fieldpress-dusky.vercel.app)";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "by",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "they",
  "them",
  "their",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "his",
  "her",
  "not",
  "no",
  "yes",
  "just",
  "also",
  "more",
  "most",
  "some",
  "any",
  "all",
  "into",
  "over",
  "under",
  "after",
  "before",
  "about",
  "than",
  "then",
  "when",
  "where",
  "what",
  "which",
  "who",
  "why",
  "how",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "have",
  "has",
  "had",
  "do",
  "did",
  "does",
  "said",
  "says",
  "say",
  "like",
  "via",
  "per",
  "note",
  "notes",
  "story",
  "field",
  "reporter",
  "today",
  "yesterday",
  "week",
]);

const WIKI_SKIP = /^(Main_Page|Special:|Wikipedia:|Portal:|File:|Template:|Help:|Talk:|User:)/i;

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseRssItems(xml: string, scale: TrendScale, limit: number): PublicHeadline[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, limit);
  const headlines: PublicHeadline[] = [];

  for (const item of items) {
    const block = item[1] ?? "";
    const rawTitle = tag(block, "title");
    if (!rawTitle) continue;

    const sourceTag = tag(block, "source");
    const dash = rawTitle.lastIndexOf(" - ");
    const title =
      sourceTag && dash > 12 ? rawTitle.slice(0, dash).trim() : rawTitle;
    const source = sourceTag || (dash > 12 ? rawTitle.slice(dash + 3).trim() : "Google News");

    headlines.push({
      scale,
      title,
      source,
      url: tag(block, "link"),
      publishedAt: tag(block, "pubDate") || undefined,
    });
  }

  return headlines;
}

async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.text();
}

export function extractSearchQuery(title: string, notes: string[]): string {
  const quoted = notes
    .join(" ")
    .match(/"([^"]{4,80})"/g)
    ?.map((q) => q.replace(/"/g, "").trim()) ?? [];

  const corpus = [title, ...notes].join(" ").toLowerCase();
  const counts = new Map<string, number>();
  for (const raw of corpus.match(/[a-z0-9][a-z0-9'-]{3,}/g) ?? []) {
    if (STOPWORDS.has(raw) || /^\d+$/.test(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }

  const keywords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word]) => word);

  const parts = [title.trim().slice(0, 90), ...quoted.slice(0, 2), ...keywords.slice(0, 4)].filter(
    Boolean,
  );
  return [...new Set(parts)].join(" ").trim() || title.trim();
}

function googleNewsUrl(path: string, query?: string): string {
  const params = new URLSearchParams({
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });
  if (query) params.set("q", `${query} when:7d`);
  return `https://news.google.com/rss${path}?${params.toString()}`;
}

async function fetchNewsFeed(
  url: string,
  scale: TrendScale,
  limit: number,
): Promise<PublicHeadline[]> {
  const xml = await fetchText(url, 8000);
  if (!xml.includes("<item")) return [];
  return parseRssItems(xml, scale, limit);
}

function yesterdayUtc(): { year: string; month: string; day: string } {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return {
    year: String(date.getUTCFullYear()),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    day: String(date.getUTCDate()).padStart(2, "0"),
  };
}

async function fetchWikipediaMostRead(): Promise<PublicHeadline[]> {
  const { year, month, day } = yesterdayUtc();
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`;
  const raw = await fetchText(url, 8000);
  const payload = JSON.parse(raw) as {
    items?: Array<{ articles?: Array<{ article?: string; views?: number }> }>;
  };
  const articles = payload.items?.[0]?.articles ?? [];
  return articles
    .filter((article) => article.article && !WIKI_SKIP.test(article.article))
    .slice(0, 8)
    .map((article) => ({
      scale: "relatable" as const,
      title: (article.article ?? "").replace(/_/g, " "),
      source: "Wikipedia most-read",
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.article ?? "")}`,
    }));
}

function dedupeHeadlines(headlines: PublicHeadline[]): PublicHeadline[] {
  const seen = new Set<string>();
  const unique: PublicHeadline[] = [];
  for (const headline of headlines) {
    const key = headline.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(headline);
  }
  return unique;
}

export async function gatherPublicHeadlines(
  title: string,
  notes: string[],
): Promise<PublicTrendBrief> {
  const query = extractSearchQuery(title, notes);
  const results = await Promise.allSettled([
    fetchNewsFeed(googleNewsUrl("/search", query), "relatable", 8),
    fetchNewsFeed(googleNewsUrl("/headlines/section/topic/NATION"), "national", 6),
    fetchNewsFeed(googleNewsUrl("/headlines/section/topic/WORLD"), "global", 6),
    fetchWikipediaMostRead(),
  ]);

  const headlines = dedupeHeadlines(
    results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
  );

  const failed = results.filter((result) => result.status === "rejected").length;
  if (failed > 0) {
    logger.warn({ failed, query, headlineCount: headlines.length }, "some public headline feeds failed");
  }

  return {
    fetchedAt: new Date().toISOString(),
    query,
    headlines: headlines.slice(0, 24),
  };
}

export function formatTrendBrief(brief: PublicTrendBrief): string {
  if (brief.headlines.length === 0) {
    return `No live public headlines could be fetched. Use widely known public context only, and label uncertainty.`;
  }

  const groups: Array<[TrendScale, string]> = [
    ["relatable", "RELATABLE / RELATED TO THIS STORY"],
    ["national", "NATIONAL CONVERSATION"],
    ["global", "GLOBAL / INTERNATIONAL"],
  ];

  const lines = [
    `Live public headlines as of ${brief.fetchedAt} (query: ${brief.query}).`,
    "These are assignment-desk context, not the reporter's observations.",
  ];

  for (const [scale, label] of groups) {
    const items = brief.headlines.filter((headline) => headline.scale === scale).slice(0, 8);
    if (items.length === 0) continue;
    lines.push("", `${label}:`);
    for (const item of items) {
      const when = item.publishedAt ? ` (${item.publishedAt})` : "";
      lines.push(`- ${item.title} — ${item.source}${when}`);
    }
  }

  return lines.join("\n");
}
