import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const pressyRouter = Router();

const SYSTEM_PROMPT =
  "You are Pressy'O, the FieldPress newsroom co-pilot and in-app desk assistant. You provide verified headline angles, field ledes, photo briefs, and verification checks. You also provide clear, numbered, step-by-step guidance on how to use FieldPress features (Top-of-Feed Quick Pressies in <15s, Spiffs-to-Drafts expansion in the Idea Desk, Visual Desk image generation, Bureau Desks and /join/:code onboarding, and WYSIWYG OpenGraph social card distribution). Keep outputs editable, factual, and concise.";

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
  const m = message.toLowerCase();

  // In-App Guidance Engine
  if (m.includes("spiff") || m.includes("draft story") || m.includes("create draft")) {
    return `### ⚡ How to Draft Stories from Spiffs
1. Open any Pressie's detail workspace (\`/story/:id\`).
2. Scroll to the **Idea Desk** and click **[GET IDEAS FROM THIS HEADLINE]**.
3. Under the **SPIFFS** section, browse the suggested reporting angles.
4. Click **[⚡ DRAFT FULL STORY]** on any Spiff card.
5. The Spiff will immediately compile into an article draft (with headline, hook, ground overview, visual brief, and verification checklist) and appear in your **DRAFTS** list!`;
  }
  if (m.includes("photo") || m.includes("image") || m.includes("visual") || m.includes("camera")) {
    return `### 📸 How to Produce & Attach Visuals
1. **Quick Top-of-Feed Dispatch:** In the headline composer, click **[CAMERA]** or **[PHOTO LIBRARY]** to attach photos inline before posting.
2. **Visual Desk (Full Pressie):** On any story detail page, open the **Visual Desk**.
3. Click **[Generate]** to render a live 35mm documentary still, or use **[Search]** for archival media.
4. Click **[Attach Visual]** to lock it as your story's 1.91:1 OpenGraph cover card.`;
  }
  if (m.includes("publish") || m.includes("post") || m.includes("quick pressie") || m.includes("how to post")) {
    return `### 🗞️ How to Post a Quick Pressie in <15s
1. At the top of the **Headline Wall / Pressie Feed**, locate the quick dispatch card.
2. Type your breaking headline and field notes.
3. Select your reaction pulse (**Cool**, **Signal**, or **Heat**).
4. Click **[POST PRESSIE]** — it immediately posts to \`/api/stories\` and refreshes the live river in under 15 seconds.`;
  }
  if (m.includes("bureau") || m.includes("desk") || m.includes("join") || m.includes("invite") || m.includes("collaborat")) {
    return `### 🏢 How Collaborative Desks Work
1. In the top navigation or desk switcher, create a new Bureau Desk.
2. Copy your unique desk invite URL (\`fieldpress.studio/join/:code\`).
3. Send it to reporters — they can click **"JOIN BUREAU AS REPORTER"** to onboard with 1 click and begin filing to your shared bureau wire.`;
  }
  if (m.includes("polish") || m.includes("headline")) {
    return `### ✨ How to Use the [✨ POLISH] Chip
1. In the headline composer, type a rough draft headline.
2. Click the **[✨ POLISH]** chip next to the headline field.
3. Pressy will immediately analyze the topic and generate three distinct newsroom angles (Breaking, Explainer, and Ground Report) that you can adopt with one click.`;
  }
  if (m.includes("distribute") || m.includes("card") || m.includes("share") || m.includes("opengraph")) {
    return `### 🚀 How to Distribute & Preview Social Cards
1. On any published Pressie, click the **[Distribute]** button.
2. A live **WYSIWYG 1.91:1 OpenGraph Card Preview** will appear, showing exactly how the card renders on social crawlers with \`fieldpress.studio\` domain attribution.
3. Choose your cover image dynamically, then click **[X]**, **[Bluesky]**, **[Facebook]**, or **[Telegram]** to trigger native share sheets.`;
  }

  // Editorial Dispatch Generation (when not asking for in-app help)
  const topic = message.slice(0, 100).trim();
  return `### ⚡ Pressy'O Wire Dispatch

**Suggested Headline:**
• Breaking: ${topic}
• Analysis: What Local Officials Are Not Saying About ${topic}

**Field Lede:**
> Ground reports confirm active developments surrounding ${topic}. Community observers and independent reporters are tracking timeline verification, jurisdictional oversight, and immediate public impact.

**Photo Brief:**
• High-contrast documentary still: Capture the frontline environment, public notices, or human subjects directly involved.

**Verification Checklist:**
1. Cross-reference first-person field reports against official agency logs.
2. Confirm timestamp and precise geo-coordinates before filing.`;
}

function fallbackIdeas(title: string): Idea[] {
  return [
    {
      headline: `BREAKING: ${title}`,
      hook: `Developing situation: First responders and community members respond on the ground as details emerge around ${title}.`,
      visual: `Documentary close-up still of the scene, natural daylight, authentic 35mm newsprint texture.`,
    },
    {
      headline: `EXPLAINER: What We Know About ${title}`,
      hook: `Separating verified facts from circulating rumors: key timelines, direct statements, and unanswered public questions.`,
      visual: `Contextual wide-angle shot showing the surrounding neighborhood, city facility, or public gathering.`,
    },
    {
      headline: `GROUND REPORT: Voices from ${title}`,
      hook: `Local residents speak out on how ${title} directly impacts transit, public safety, and neighborhood accountability.`,
      visual: `Environmental portrait of witnesses and workers observing the situation without staged posing.`,
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
  if (!process.env.GEMINI_API_KEY) {
    try { (process as any).loadEnvFile?.("artifacts/api-server/.env"); } catch {}
    try { (process as any).loadEnvFile?.(".env"); } catch {}
  }
  const apiKey = text(process.env.GEMINI_API_KEY, 512);
  if (!apiKey) throw new Error("AI provider is not configured");

  const preferred = text(process.env.GEMINI_MODEL, 120);
  const models = [
    preferred,
    "gemini-3.6-flash",
    "gemini-3.5-flash",
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
              maxOutputTokens: options.maxOutputTokens ?? 8192,
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


pressyRouter.post("/stories/:id/ideas", async (req: Request, res: Response) => {
  const title = text(req.body?.title ?? req.body?.prompt, 255) || "Field Report";
  const prompt = `${SYSTEM_PROMPT}

You are generating editable newsroom idea suggestions for a headline. Return valid JSON only:
{
  "ideas": [
    { "headline": "string", "hook": "string", "visual": "string" }
  ]
}

Return exactly three ideas. These are suggestions, not finished copy.
Headline: ${title}
Reporter prompt: ${text(req.body?.prompt, 4_000) || "(none)"}`;

  try {
    const raw = await generateWithGemini(prompt);
    const ideas = safeIdeas(JSON.parse(raw) as unknown, title);
    res.json({
      ideas,
      spiffs: ideas,
      searchQueries: [title],
      articleIdeas: ideas.map((i) => i.headline),
      socialIdeas: ideas.map((i) => i.hook),
      podcastIdeas: ideas.map((i) => `${i.headline} - ${i.hook}`),
      automates: false,
      source: "gemini",
    });
  } catch {
    const ideas = fallbackIdeas(title);
    res.json({
      ideas,
      spiffs: ideas,
      searchQueries: [title],
      articleIdeas: ideas.map((i) => i.headline),
      socialIdeas: ideas.map((i) => i.hook),
      podcastIdeas: ideas.map((i) => `${i.headline} - ${i.hook}`),
      automates: false,
      source: "fallback",
      notice: "Pressy generated baseline editorial ideas while live AI is unavailable.",
    });
  }
});

export default pressyRouter;

