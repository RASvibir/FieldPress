import { formatTrendBrief, gatherPublicHeadlines } from "./trends";
import { logger } from "./logger";

const PRODUCER_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    outline: { type: "array", items: { type: "string" } },
    caption: { type: "string" },
    whyNow: { type: "string" },
    audience: { type: "string" },
    articleTitle: { type: "string" },
    article: { type: "string" },
    socialTitle: { type: "string" },
    social: { type: "string" },
    podcastTitle: { type: "string" },
    podcast: { type: "string" },
    trends: {
      type: "array",
      items: {
        type: "object",
        properties: {
          scale: { type: "string", enum: ["relatable", "national", "global"] },
          headline: { type: "string" },
          whyItMatters: { type: "string" },
          productHook: { type: "string" },
          source: { type: "string" },
        },
        required: ["scale", "headline", "whyItMatters", "productHook"],
      },
    },
  },
  required: [
    "summary",
    "outline",
    "caption",
    "whyNow",
    "audience",
    "articleTitle",
    "article",
    "socialTitle",
    "social",
    "podcastTitle",
    "podcast",
    "trends",
  ],
} as const;

export type ProducerMode = "article" | "social" | "podcast";

export type ProducerDraft = {
  mode: ProducerMode;
  title: string;
  content: string;
};

export type ProducerTrend = {
  scale: "relatable" | "national" | "global";
  headline: string;
  whyItMatters: string;
  productHook: string;
  source?: string;
};

export type ProducerResult = {
  summary: string;
  outline: string[];
  caption: string;
  whyNow: string;
  audience: string;
  trends: ProducerTrend[];
  drafts: ProducerDraft[];
  trendQuery: string;
  headlineCount: number;
};

type GeminiJson = {
  summary: string;
  outline: string[];
  caption: string;
  whyNow?: string;
  audience?: string;
  articleTitle: string;
  article: string;
  socialTitle: string;
  social: string;
  podcastTitle: string;
  podcast: string;
  trends?: Array<{
    scale?: string;
    headline?: string;
    whyItMatters?: string;
    productHook?: string;
    source?: string;
  }>;
};

function extractText(payload: unknown): string {
  const candidate = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }).candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts.map((part) => part.text ?? "").join("");
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}

function geminiEndpoint(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function isRetryableGeminiError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /Gemini (429|503)\b/.test(message);
}

async function geminiPost(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(geminiEndpoint(model), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) {
        return response.json();
      }
      const detail = await response.text();
      const err = new Error(`Gemini ${response.status}: ${detail.slice(0, 400)}`);
      if ((response.status === 429 || response.status === 503) && attempt < 2) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 1500 * 2 ** attempt));
        continue;
      }
      throw err;
    } catch (err) {
      lastError = err;
      if (attempt < 2 && isRetryableGeminiError(err)) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * 2 ** attempt));
        continue;
      }
      if (attempt < 2 && err instanceof Error && err.name === "TimeoutError") {
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini request failed");
}

function normalizeTrends(raw: GeminiJson["trends"]): ProducerTrend[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(["relatable", "national", "global"]);
  return raw
    .map((item) => {
      const scale = allowed.has(item.scale ?? "")
        ? (item.scale as ProducerTrend["scale"])
        : "relatable";
      return {
        scale,
        headline: (item.headline ?? "").trim(),
        whyItMatters: (item.whyItMatters ?? "").trim(),
        productHook: (item.productHook ?? "").trim(),
        source: item.source?.trim() || undefined,
      };
    })
    .filter((item) => item.headline && item.whyItMatters && item.productHook)
    .slice(0, 8);
}

async function gatherEditorialTrendBrief(input: {
  apiKey: string;
  model: string;
  title: string;
  notes: string;
  headlineBrief: string;
  today: string;
}): Promise<string> {
  const prompt = `You are a news assignment editor. Search CURRENT public conversation as of ${input.today}.

Find what actually helps this field story land with audiences:
1. Relatable: everyday stakes, human-interest, questions non-experts are already asking.
2. National: policy, institutions, politics, economy, who holds power in the country this story sits in.
3. Global: international parallels, knock-on effects, why a listener overseas should care.

Rules:
- Search the live web. Prefer the last 7 days.
- Only keep connections that are genuine. If a headline is unrelated, drop it.
- Do not invent facts about the reporter's scene.
- Return a compact briefing in this shape (plain text, not JSON):
WHY NOW:
RELATABLE:
NATIONAL:
GLOBAL:
PRODUCT HOOKS:
- article:
- social:
- podcast:
SOURCES:

Story title: ${input.title}

Field notes:
${input.notes}

Headlines already pulled:
${input.headlineBrief}`;

  const payload = await geminiPost(
    input.apiKey,
    input.model,
    {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.3,
      },
    },
    22000,
  );

  return extractText(payload).trim();
}

export async function generateProducerDraft(input: {
  title: string;
  notes: string[];
  audioCount?: number;
}): Promise<ProducerResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";
  const notes =
    input.notes.length > 0
      ? input.notes.map((note, i) => `${i + 1}. ${note}`).join("\n")
      : "(no field notes yet)";
  const audioLine =
    input.audioCount && input.audioCount > 0
      ? `\nAudio clips recorded: ${input.audioCount} (no transcript available yet).`
      : "";
  const today = new Date().toISOString().slice(0, 10);

  const publicHeadlines = await gatherPublicHeadlines(input.title, input.notes).catch((err) => {
    logger.warn({ err }, "public headline fetch failed");
    return {
      fetchedAt: new Date().toISOString(),
      query: input.title,
      headlines: [],
    };
  });
  const headlineBrief = formatTrendBrief(publicHeadlines);
  logger.info(
    { headlineCount: publicHeadlines.headlines.length, query: publicHeadlines.query },
    "public headlines gathered",
  );

  const searchEnabled = /^(1|true|yes)$/i.test(process.env.GEMINI_TREND_SEARCH?.trim() || "");
  const editorialBrief = searchEnabled
    ? await gatherEditorialTrendBrief({
        apiKey,
        model,
        title: input.title,
        notes,
        headlineBrief,
        today,
      }).catch((err) => {
        logger.warn({ err }, "editorial trend search failed");
        return "";
      })
    : "";

  const prompt = `You are FieldPress: assignment editor and producer for indie journalists. Turn field notes into the strongest possible news products by connecting what the reporter actually witnessed to what the public is already talking about.

TODAY: ${today}

HARD RULES
- Field notes are the only source of original facts, quotes, names, casualty counts, and on-scene detail. Do not invent them.
- Public context is for WHY NOW, comparisons, and audience hooks. Never present a public headline as something the reporter observed.
- If a trend is only loosely related, say so or drop it. Do not force a fake connection.
- If notes are thin, say what is known and what still needs verification.
- Keep the voice concrete and field-side, not marketing.

MAKE IT LAND
- Relatable: one human scene, everyday stakes, the question a non-expert would ask.
- National: institutions, policy, who holds power, what this says about the country.
- Global: parallels, knock-on effects, why a listener overseas should care.

OUTPUTS
- article: publication-ready. Lede with a scene or a why-now. Nut graf that places this reporting inside the public conversation. Body from notes. Kicker that looks forward.
- social: open with the public hook people already recognize, then the exclusive field detail they cannot get elsewhere. Thread or caption. Hashtags that match real conversation, not generic #News.
- podcast: cold open that poses the national/global question, then drop into the reporter's scene. Segments, outro, and show notes that list "this week's conversation" as public context.
- summary: 2-4 sentences — what happened (from notes) plus why it matters now (from public context).
- outline: section headings a producer can follow, including a why-now beat.
- caption: short social line with a few sharp hashtags.
- whyNow: one tight assignment-desk paragraph.
- audience: who this is for and the relatable entry point.
- trends: 3-6 items across relatable, national, and global that actually help this story. productHook says how to use it in article, social, or podcast. source is the outlet or "public conversation".

Story title: ${input.title}
${audioLine}

Field notes:
${notes}

LIVE PUBLIC HEADLINES:
${headlineBrief}

${editorialBrief ? `ASSIGNMENT EDITOR BRIEFING (from live search):\n${editorialBrief}` : "No live search briefing. Use the headlines above and clearly labeled widely known public context."}`;

  const payload = await geminiPost(
    apiKey,
    model,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: PRODUCER_SCHEMA,
        maxOutputTokens: 8192,
        temperature: 0.55,
      },
    },
    45000,
  );

  const parsed = JSON.parse(extractText(payload)) as GeminiJson;
  const trends = normalizeTrends(parsed.trends);

  logger.info(
    {
      headlineCount: publicHeadlines.headlines.length,
      trendCount: trends.length,
      searched: Boolean(editorialBrief),
    },
    "producer draft generated with trend desk",
  );

  return {
    summary: parsed.summary,
    outline: parsed.outline,
    caption: parsed.caption,
    whyNow: (parsed.whyNow ?? "").trim(),
    audience: (parsed.audience ?? "").trim(),
    trends,
    trendQuery: publicHeadlines.query,
    headlineCount: publicHeadlines.headlines.length,
    drafts: [
      { mode: "article", title: parsed.articleTitle, content: parsed.article },
      { mode: "social", title: parsed.socialTitle, content: parsed.social },
      { mode: "podcast", title: parsed.podcastTitle, content: parsed.podcast },
    ],
  };
}
