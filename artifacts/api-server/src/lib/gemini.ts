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

async function ollamaPost(
  host: string,
  model: string,
  prompt: string,
  timeoutMs: number = 60000,
): Promise<string> {
  const endpoint = `${host.replace(/\/v1\/?$/, "")}/api/generate`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${prompt}\n\nIMPORTANT: Respond with pure JSON matching the requested keys (summary, outline, caption, whyNow, audience, articleTitle, article, socialTitle, social, podcastTitle, podcast, trends).`,
      format: "json",
      stream: false,
      options: {
        num_ctx: 4096,
        temperature: 0.55,
      },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama ${response.status}: ${detail.slice(0, 400)}`);
  }

  const data = (await response.json()) as { response: string };
  return data.response;
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

  const prompt = `You are FieldPress: assignment editor and producer for indie journalists. Turn field notes into the strongest possible news products by connecting what the reporter actually witnessed to what the public is already talking about.

TODAY: ${today}

HARD RULES
- Field notes are the only source of original facts, quotes, names, casualty counts, and on-scene detail. Do not invent them.
- Public context is for WHY NOW, comparisons, and audience hooks. Never present a public headline as something the reporter observed.
- If a trend is only loosely related, say so or drop it. Do not force a fake connection.
- If notes are thin, say what is known and what still needs verification.
- Keep the voice concrete and field-side, not marketing.

OUTPUTS (JSON):
- article: publication-ready story.
- social: thread or sharp post.
- podcast: script with cold open, segments, and outro.
- summary: 2-4 sentences.
- outline: array of string section headings.
- caption: short social headline.
- whyNow: tight assignment-desk paragraph.
- audience: target audience.
- trends: array of objects { scale, headline, whyItMatters, productHook, source }.

Story title: ${input.title}
${audioLine}

Field notes:
${notes}

LIVE PUBLIC HEADLINES:
${headlineBrief}`;

  let parsed: GeminiJson;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  const ollamaModel = process.env.AI_MODEL || process.env.OLLAMA_MODEL || "llama3.2";
  let ollamaDraft = "";
  try {
    logger.info({ provider: "ollama", host: ollamaHost, model: ollamaModel }, "producer first pass via Ollama");
    ollamaDraft = await ollamaPost(ollamaHost, ollamaModel, prompt, 45000);
  } catch (err) {
    logger.warn({ err }, "ollama producer pass failed");
  }
  if (apiKey) {
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";
    const geminiPrompt = ollamaDraft
      ? `${prompt}\n\nOLLAMA DRAFT TO TIGHTEN (do not add facts):\n${ollamaDraft.slice(0, 6000)}`
      : prompt;
    logger.info({ provider: "gemini", model, polishedOllama: Boolean(ollamaDraft) }, "producer Gemini pass");
    const payload = await geminiPost(
      apiKey,
      model,
      {
        contents: [{ parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: ollamaDraft ? 1536 : 4096,
          temperature: 0.4,
        },
      },
      40000,
    );
    parsed = JSON.parse(extractText(payload)) as GeminiJson;
  } else if (ollamaDraft) {
    parsed = JSON.parse(ollamaDraft) as GeminiJson;
  } else {
    throw new Error("No desk AI available (Ollama and Gemini both failed)");
  }

  const trends = normalizeTrends(parsed.trends);

  return {
    summary: parsed.summary || "",
    outline: parsed.outline || [],
    caption: parsed.caption || "",
    whyNow: (parsed.whyNow ?? "").trim(),
    audience: (parsed.audience ?? "").trim(),
    trends,
    trendQuery: publicHeadlines.query,
    headlineCount: publicHeadlines.headlines.length,
    drafts: [
      { mode: "article", title: parsed.articleTitle || `${input.title} — Field Report`, content: parsed.article || "" },
      { mode: "social", title: parsed.socialTitle || `${input.title} — Social Thread`, content: parsed.social || "" },
      { mode: "podcast", title: parsed.podcastTitle || `${input.title} — Audio Dispatch`, content: parsed.podcast || "" },
    ],
  };
}
