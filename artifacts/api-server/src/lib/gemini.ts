const PRODUCER_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    outline: { type: "array", items: { type: "string" } },
    caption: { type: "string" },
    articleTitle: { type: "string" },
    article: { type: "string" },
    socialTitle: { type: "string" },
    social: { type: "string" },
    podcastTitle: { type: "string" },
    podcast: { type: "string" },
  },
  required: [
    "summary",
    "outline",
    "caption",
    "articleTitle",
    "article",
    "socialTitle",
    "social",
    "podcastTitle",
    "podcast",
  ],
} as const;

export type ProducerMode = "article" | "social" | "podcast";

export type ProducerDraft = {
  mode: ProducerMode;
  title: string;
  content: string;
};

export type ProducerResult = {
  summary: string;
  outline: string[];
  caption: string;
  drafts: ProducerDraft[];
};

type GeminiJson = {
  summary: string;
  outline: string[];
  caption: string;
  articleTitle: string;
  article: string;
  socialTitle: string;
  social: string;
  podcastTitle: string;
  podcast: string;
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

  const prompt = `You are FieldPress, a news producer for indie journalists. Turn field notes into usable drafts.

Rules:
- Use only the provided notes. Do not invent quotes, unnamed sources, casualty counts, or facts that are not in the notes.
- If notes are thin, say what is known and what still needs verification.
- Keep the voice concrete and field-side, not marketing.
- article: publication-ready piece with headline, lede, body, nut graf, kicker.
- social: a short thread or caption a reporter can post now.
- podcast: cold open, intro, segments, outro, show notes.
- summary: 2-4 sentences. outline: section headings. caption: short social line with a few hashtags.

Story title: ${input.title}
${audioLine}

Field notes:
${notes}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: PRODUCER_SCHEMA,
          maxOutputTokens: 4096,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini ${response.status}: ${detail.slice(0, 400)}`);
  }

  const parsed = JSON.parse(extractText(await response.json())) as GeminiJson;

  return {
    summary: parsed.summary,
    outline: parsed.outline,
    caption: parsed.caption,
    drafts: [
      { mode: "article", title: parsed.articleTitle, content: parsed.article },
      { mode: "social", title: parsed.socialTitle, content: parsed.social },
      { mode: "podcast", title: parsed.podcastTitle, content: parsed.podcast },
    ],
  };
}
