import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const pressyRouter = Router();

const SYSTEM_PROMPT =
  "You are Pressy, the FieldPress desk bot. Complete sentences. Do not invent facts, quotes, names, sources, or events. You provide editable editorial assistance only. Never publish, post, send, distribute, change authorship, or make final editorial decisions.";

type HistoryTurn = {
  role?: unknown;
  content?: unknown;
};

type Idea = {
  headline: string;
  hook: string;
  visual: string;
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normaliseHistory(value: unknown): Array<{ role: "Reporter" | "Pressy"; content: string }> {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-10)
    .map((turn: HistoryTurn): { role: "Reporter" | "Pressy"; content: string } => {
      const role = text(turn?.role, 24).toLowerCase();
      const content = text(turn?.content, 2_000);

      return {
        role:
          role === "pressy" || role === "assistant" || role === "model"
            ? "Pressy"
            : "Reporter",
        content,
      };
    })
    .filter((turn) => turn.content);
}

function fallbackReply(message: string): string {
  const normalized = message.toLowerCase().trim();

  if (/^(hi|hello|hey|yo|sup)[!.?\s]*$/i.test(normalized)) {
    return "Pressy here. Give me a headline, a field note, or a rough assignment and I can help with a lede, headline options, a nut graf, a photo brief, or what still needs checking.";
  }

  return `Pressy here. For “${message.slice(
    0,
    120,
  )},” start by separating what is confirmed from what still needs reporting. I can help shape a lede, headline options, a visual brief, or a verification checklist. Nothing is published or changed unless you choose to do it.`;
}

function fallbackIdeas(title: string): Idea[] {
  return [
    {
      headline: title,
      hook: "Start with the clearest confirmed development, then name what remains unverified.",
      visual: "A documentary still focused on one specific human or place detail tied to the headline.",
    },
    {
      headline: `${title}: what still needs checking`,
      hook: "Frame the reporting gap plainly: who knows, what record is needed, and what the public does not know yet.",
      visual: "A quiet reporting scene: notes, public records, a newsroom desk, or a relevant location without staged drama.",
    },
    {
      headline: `Why ${title} matters now`,
      hook: "Connect the immediate development to the people, place, or decision affected by it.",
      visual: "A wider contextual scene that establishes time, place, and stakes.",
    },
  ];
}

function parseModelText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const row = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    output_text?: string;
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (typeof row.output_text === "string" && row.output_text.trim()) return row.output_text.trim();

  const gemini = row.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  if (gemini) return gemini;

  return row.choices?.[0]?.message?.content?.trim() || "";
}

async function generateWithGemini(
  prompt: string,
  options: { json?: boolean; maxOutputTokens?: number } = {},
): Promise<string> {
  const apiKey = text(process.env.GEMINI_API_KEY, 512);
  if (!apiKey) throw new Error("AI provider is not configured");

  const preferred = text(process.env.GEMINI_MODEL, 120);
  const models = [
    preferred,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
  ].filter((model, index, values) => model && values.indexOf(model) === index);

  let failure = "AI provider did not return a reply";

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(20_000),
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: options.maxOutputTokens ?? 700,
              ...(options.json ? { responseMimeType: "application/json" } : {}),
            },
          }),
        },
      );

      const raw = await response.text();

      if (!response.ok) {
        failure = `AI provider temporarily unavailable (${response.status})`;
        continue;
      }

      const reply = parseModelText(JSON.parse(raw) as unknown);
      if (reply) return reply;

      failure = "AI provider returned an empty reply";
    } catch (error) {
      failure = error instanceof Error ? error.message : failure;
    }
  }

  throw new Error(failure);
}

function safeIdeas(value: unknown, title: string): Idea[] {
  if (!value || typeof value !== "object") return fallbackIdeas(title);

  const row = value as { ideas?: unknown; spiffs?: unknown };
  const source = Array.isArray(row.ideas) ? row.ideas : Array.isArray(row.spiffs) ? row.spiffs : [];

  const ideas = source
    .slice(0, 3)
    .map((item): Idea | null => {
      if (!item || typeof item !== "object") return null;
      const idea = item as Record<string, unknown>;
      const headline = text(idea.headline, 255) || title;
      const hook = text(idea.hook, 800);
      const visual = text(idea.visual, 800);
      if (!hook && !visual) return null;
      return { headline, hook, visual };
    })
    .filter((idea): idea is Idea => Boolean(idea));

  return ideas.length ? ideas : fallbackIdeas(title);
}

pressyRouter.post("/pressy", async (req: Request, res: Response) => {
  const message = text(req.body?.message, 4_000);
  const history = normaliseHistory(req.body?.history);

  if (!message) {
    res.status(400).json({ error: "Prompt Pressy with a question or headline." });
    return;
  }

  const transcript = history.map((turn) => `${turn.role}: ${turn.content}`).join("\n");
  const prompt = `${SYSTEM_PROMPT}

If the reporter greets you, greet back in one concise sentence and offer a concrete editorial next move.
Keep outputs editable and clearly provisional. Do not claim a task was performed unless it happened in this conversation.

Prior conversation:
${transcript || "(none)"}

Reporter: ${message}
Reply as Pressy in plain text.`;

  try {
    const reply = await generateWithGemini(prompt);
    res.json({ reply, name: "Pressy", desk: "gemini", fallback: false });
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : "unknown", context: "pressy-chat" },
      "Pressy AI provider unavailable; returning local editorial fallback",
    );
    res.json({
      reply: fallbackReply(message),
      name: "Pressy",
      desk: "local",
      fallback: true,
      notice: "Pressy is using a local editorial fallback while the live AI desk is unavailable.",
    });
  }
});

pressyRouter.post("/pressy/flow", async (req: Request, res: Response) => {
  const title = text(req.body?.title ?? req.body?.prompt, 255);
  const promptDetail = text(req.body?.prompt, 4_000);

  if (!title) {
    res.status(400).json({ error: "Give Pressy a headline to generate ideas." });
    return;
  }

  const prompt = `${SYSTEM_PROMPT}

You are generating editable newsroom idea suggestions for a headline. Return valid JSON only:
{
  "ideas": [
    { "headline": "string", "hook": "string", "visual": "string" }
  ]
}

Return exactly three ideas. These are suggestions, not finished copy.

Treat the supplied headline and additional context as the only known facts. Do not add names, dates, places, vote outcomes, policy details, motives, affected groups, service hours, routes, costs, funding, quotations, or implementation claims that the reporter did not provide. If a detail is unknown, phrase it as a reporting question or verification task.

Do not publish, create, save, send, distribute, change authorship, or make a final editorial decision.

Headline: ${title}
Additional context: ${promptDetail || "(none)"}`;

  try {
    const raw = await generateWithGemini(prompt, { json: true, maxOutputTokens: 900 });
    const ideas = safeIdeas(JSON.parse(raw) as unknown, title);
    res.json({ ideas, automates: false, source: "gemini" });
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : "unknown", context: "pressy-flow" },
      "Pressy idea provider unavailable; returning local editorial fallback",
    );
    res.json({
      ideas: fallbackIdeas(title),
      automates: false,
      source: "local",
      notice: "Pressy is using local editorial suggestions while the live AI desk is unavailable.",
    });
  }
});

export default pressyRouter;
