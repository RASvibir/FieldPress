export interface MediaSearchResult {
  id: number | string;
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  license: string;
  description: string;
  width?: number;
  height?: number;
}

export class WikimediaRateLimitError extends Error {
  constructor() {
    super(
      "Archival image search is temporarily rate-limited by Wikimedia. Please wait a moment and try again.",
    );
    this.name = "WikimediaRateLimitError";
  }
}

const SEARCH_CACHE_TTL_MS = 60_000;
const SEARCH_CACHE_MAX = 50;
const searchCache = new Map<string, { expiresAt: number; results: MediaSearchResult[] }>();

function cacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function getCachedSearch(query: string): MediaSearchResult[] | null {
  const key = cacheKey(query);
  const entry = searchCache.get(key);

  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return null;
  }

  return entry.results;
}

function setCachedSearch(query: string, results: MediaSearchResult[]): void {
  const key = cacheKey(query);

  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }

  searchCache.set(key, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    results,
  });
}

function retryDelay(response: Response): number {
  const retryAfter = response.headers.get("retry-after");
  const seconds = retryAfter ? Number(retryAfter) : Number.NaN;

  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.min(Math.ceil(seconds * 1_000), 3_000);
  }

  return 750;
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchArchivalMedia(query: string): Promise<MediaSearchResult[]> {
  const cached = getCachedSearch(query);
  if (cached) return cached;

  const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    query,
  )}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|size&format=json&origin=*`;

  let response: Response | undefined;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(wikiUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "FieldPress/1.0 archival-image-search",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) break;

    if (response.status === 429 && attempt === 0) {
      await pause(retryDelay(response));
      continue;
    }

    if (response.status >= 500 && attempt === 0) {
      await pause(500);
      continue;
    }

    if (response.status === 429) throw new WikimediaRateLimitError();

    throw new Error(`Wikimedia API error: ${response.status} ${response.statusText}`.trim());
  }

  if (!response) throw new Error("Wikimedia API did not respond");
  if (response.status === 429) throw new WikimediaRateLimitError();
  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status} ${response.statusText}`.trim());
  }

  const data = (await response.json()) as { query?: { pages?: Record<string, unknown> } };
  const pages = data.query?.pages || {};

  const results = Object.values(pages)
    .map((page: any) => {
      const info = page.imageinfo?.[0] || {};
      const meta = info.extmetadata || {};

      return {
        id: page.pageid,
        title: (page.title || "").replace(/^File:/, ""),
        url: info.url || "",
        thumbUrl: info.thumburl || info.url || "",
        author: meta.Artist?.value || "Unknown",
        license: meta.LicenseShortName?.value || "Public Domain / CC",
        description: meta.ImageDescription?.value || "",
        width: info.width,
        height: info.height,
      } satisfies MediaSearchResult;
    })
    .filter((item) => Boolean(item.url) && /\.(jpe?g|png|webp)$/i.test(item.url.split("?")[0].toLowerCase()));

  setCachedSearch(query, results);
  return results;
}

export function synthesizePhotoPrompt(params: {
  format?: string;
  headline?: string;
  fieldNotes?: string;
}) {
  const { format = 'article_hero', headline = '', fieldNotes = '' } = params;
  const baseStyle =
    'Cinematic editorial photojournalism, authentic 35mm film grain, documentary style, natural lighting, Pulitzer-winning photography';

  const formatMap: Record<string, { ar: string; label: string }> = {
    article_hero: { ar: '16:9', label: '16:9 Hero' },
    social_feed: { ar: '4:5', label: '4:5 Social' },
    podcast_square: { ar: '1:1', label: '1:1 Podcast' },
  };

  const selected = formatMap[format] || formatMap.article_hero;
  const prompt = `${headline ? headline + '. ' : ''}${fieldNotes ? fieldNotes + '. ' : ''}${baseStyle} --ar ${selected.ar}`.trim();

  return {
    format,
    headline,
    prompt,
    aspectRatio: selected.ar,
  };
}
