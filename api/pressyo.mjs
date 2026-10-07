// Pressy'o AI Journalism Copilot — serverless endpoint (writing & editing only; no image generation).
//
// Strategy: try local Ollama first (free, fast, runs on the publisher's own
// machine via a Cloudflare Tunnel at OLLAMA_URL) for cost/token budget, and
// fall back to Gemini (reliable, always-on) if Ollama is unreachable, times
// out, or isn't configured. The frontend never needs to know which one
// answered beyond the `source` field returned for transparency.
//
// Auth + daily rate limit (migration 0012_pressyo_usage_schema): this
// endpoint previously had no authentication and no ceiling at all, and on
// Ollama-unreachable it falls through to a metered Gemini key, so an
// anonymous caller in a loop had a real cost impact. It now requires a
// session (same as every other write-ish endpoint) and enforces a per
// account daily cap via fieldpress_pressyo_usage, keyed on the
// America/Chicago calendar date to match the existing client-side
// "Chicago Midnight Quota" convention used for visual generations.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "./_lib/auth.mjs";
import { fetchLeadSourceArticles } from "./_lib/leadSearch.mjs";
import { buildCaptionAltSystemPrompt, parseCaptionAltReply } from "./_lib/pressyoCaptionAlt.mjs";

const sql = neon(process.env.DATABASE_URL);

const DAILY_LIMIT = parseInt(process.env.PRESSYO_DAILY_LIMIT || "40", 10);

function chicagoDateString() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// Check current daily usage before invoking any upstream LLM so a 502
// across all providers never burns a reporter's daily quota.
async function getUsageToday(accountId) {
  const today = chicagoDateString();
  const rows = await sql`
    SELECT count FROM fieldpress_pressyo_usage
    WHERE account_id = ${accountId} AND usage_date = ${today}
    LIMIT 1;
  `;
  return rows.length > 0 ? Number(rows[0].count) : 0;
}

// Atomic upsert-and-increment: single round trip, no read-then-write race
// between concurrent requests from the same account. Returns the count
// *after* incrementing.
async function incrementUsage(accountId) {
  const today = chicagoDateString();
  const [row] = await sql`
    INSERT INTO fieldpress_pressyo_usage (account_id, usage_date, count, updated_at)
    VALUES (${accountId}, ${today}, 1, now())
    ON CONFLICT (account_id, usage_date)
    DO UPDATE SET count = fieldpress_pressyo_usage.count + 1, updated_at = now()
    RETURNING count;
  `;
  return row.count;
}

// Tier 1: Local / Tunnel / Cloud Ollama (free & private primary)
const OLLAMA_URL = (process.env.OLLAMA_URL || process.env.OLLAMA_HOST || "https://ollama.fieldpress.studio").replace(/\/+$/, "");
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || "";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_TIMEOUT_MS = 8000;

// Tier 2: Groq LPU Inference (ultra-low-latency Llama 3.3 secondary failover)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_TIMEOUT_MS = 10000;

// Tier 3: Google Gemini (high-availability cloud tertiary failover)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = 12000;

const EDITION_VOICE = {
  newspaper: "1920s broadsheet newspaper: formal, authoritative, vintage wire-service diction. Prefer words like 'yesterday', 'according to', 'authorities confirm'.",
  comic: "punchy comic book panel: short exclamatory bursts, onomatopoeia (BAM, ZAP, KAPOW), a pulpy superhero-adjacent tone.",
  arcade: "retro 8-bit arcade game telemetry: ALL CAPS status lines, terse system-log phrasing, references to levels/missions/bosses.",
  magazine: "sleek modern lifestyle magazine: clean, confident, conversational, trend-aware.",
  tactical: "encrypted tactical field intelligence briefing: terse, clipped, coordinate/callsign-heavy, no flourish.",
  fieldnote: "naturalist field expedition notebook: observant, ecological, sensory-rich, noting coordinates, flora/fauna habitats, and conservation milestones.",
  almanac: "timeless American Farmer's Almanac & WPA heritage guide: warm, folksy yet encyclopedic, weaving historical perspective and seasonal wisdom.",
  curio: "offbeat Americana zine & watercooler oddity column: witty, affectionate, marveling at strange-but-true human and wildlife capers."
};

// Previously this always instructed the model to produce "real dispatch
// copy" no matter what was asked, and the client unconditionally rendered
// every reply as a draft card -- so Pressy'o tried to write a pressie for
// every message, including plain questions and chit-chat. This system
// prompt instead makes the model classify its own reply as either a
// drafted dispatch or ordinary conversation, and say which one it is via
// a machine-readable header line the handler parses below. The two
// response shapes:
//
//   TYPE: draft
//   TITLE: <headline>
//   <dispatch body in the requested edition voice>
//
//   TYPE: chat
//   <a normal, helpful reply -- answer the question, discuss, brainstorm,
//   fact-check, ask a clarifying question, whatever fits -- no edition
//   voice, no dispatch structure>
//
// Only an explicit ask to write/draft/compose a dispatch, pressie, or
// story should produce TYPE: draft. Everything else -- questions, "what
// do you think", requests for feedback, small talk, "how does X work" --
// is TYPE: chat.
function buildSystemPrompt(editionStyle, editorAction, draftContext) {
  const voice = EDITION_VOICE[editionStyle] || EDITION_VOICE.tactical;
  const styleName = editionStyle || "tactical";

  const contextBlock = draftContext && (draftContext.title || draftContext.content)
    ? `\n\nCURRENT ACTIVE DRAFT IN DISPATCH COMPOSER:
- Headline: ${draftContext.title || "(none)"}
- Edition Style: ${draftContext.editionStyle || styleName}
- Filing location: ${draftContext.location || "(not set)"}
- Body:
${draftContext.content || "(empty)"}`
    : "";

  const journalismRules = `You are a journalism copilot only — no image generation, no visual prompts, no Pollinations/Flux/DALL·E instructions. If the user asks for images, tell them to create art in imbrgr (https://imbrgr.vercel.app) and paste the image URL into their dispatch.`;

  if (editorAction === "headlines") {
    return `${journalismRules}
You are Pressy'o, the FieldPress journalism assistant.
Write a punchy headline in the "${styleName}" edition voice (${voice}) and lightly polish the opening lede while preserving the full body.

Respond in EXACTLY this format (nothing before TYPE:):
TYPE: draft
TITLE: <the new headline>
<the dispatch body>${contextBlock}`;
  }

  if (
    editorAction === "rewrite_voice" ||
    editorAction === "expand" ||
    editorAction === "shorten" ||
    editorAction === "factcheck_polish" ||
    editorAction === "draft_from_topic" ||
    editorAction === "social_thread" ||
    editorAction === "uplift_angle" ||
    editorAction === "lede_suggest" ||
    editorAction === "attribution_check" ||
    editorAction === "ap_style_polish" ||
    editorAction === "structure_dispatch" ||
    editorAction === "punchier" ||
    editorAction === "grammar_polish" ||
    editorAction === "custom_edit"
  ) {
    const actionInstructions = {
      rewrite_voice: `Rewrite the headline and body into the "${styleName}" edition voice (${voice}). Preserve facts, datelines, and named sources.`,
      expand: `Expand the dispatch in the "${styleName}" voice with reporting detail and context (2–3 paragraphs). Stay factual; flag anything that needs verification.`,
      shorten: `Tighten into crisp wire copy in the "${styleName}" voice — strong verbs, short sentences.`,
      factcheck_polish: `Polish grammar and clarity; note internal inconsistencies or claims that need a source. Suggest [VERIFY] tags inline where appropriate.`,
      draft_from_topic: `Draft a complete dispatch from the headline/topic in the "${styleName}" voice: strong lede, nut graf, clear attribution placeholders where quotes are implied.`,
      uplift_angle: `Reframe toward solutions and human impact while staying honest — no fluff.`,
      social_thread: `Append a "📣 SOCIAL WIRE" block: one <280-char hook plus a 15-second broadcast read.`,
      lede_suggest: `Propose three alternative opening ledes (labeled A/B/C) in chat style, then apply the best one in an updated draft body.`,
      attribution_check: `Review for missing attribution, vague sourcing, and libel risk. Fix what you can in the draft; list remaining questions in a short "Editor's notes" chat follow-up.`,
      ap_style_polish: `Light AP-style polish: datelines, numbers, titles, punctuation, and headline casing — without flattening the edition voice.`,
      structure_dispatch: `Reorder the draft for news flow: lede, context, quotes/details, kicker. Use short subheads only if helpful.`,
      punchier: `Make the copy more vivid and punchy while staying accurate — stronger verbs, tighter sentences, no hype.`,
      grammar_polish: `Fix grammar, punctuation, and awkward phrasing. Preserve meaning and voice.`,
      custom_edit: `Apply the user's editing instruction while keeping the "${styleName}" edition voice.`
    };

    return `${journalismRules}
You are Pressy'o, the in-editor journalism assistant for FieldPress (edition voices: tactical, newspaper, fieldnote, almanac, curio, comic, arcade, magazine).
Task: ${actionInstructions[editorAction] || actionInstructions.custom_edit}

Respond in EXACTLY this format — first line must be "TYPE: draft":
TYPE: draft
TITLE: <headline>
<full updated dispatch body in voice: ${voice}>

No meta-commentary about being an AI.${contextBlock}`;
  }

  return `${journalismRules}
You are Pressy'o, the FieldPress journalism assistant: drafting, editing, headlines, ledes, structure, clarity, attribution checks, and light AP-style polish across edition voices:
tactical, newspaper, fieldnote, almanac, curio, comic, arcade, magazine.

Do not write full dispatch copy unless the user asks to draft, write, rewrite, or compose a dispatch/story/pressie.${contextBlock}

Respond in EXACTLY one of these formats — first line must be TYPE: draft or TYPE: chat:

TYPE: draft
TITLE: <headline>
<body in edition voice: ${voice}>

TYPE: chat
<helpful journalism coaching — questions, headline lists, fact-check prompts, outline ideas, no fake quotes>

Never use TYPE: visual. No image prompts.`;
}

// Parses the TYPE: header the model was instructed to emit. Falls back to
// "chat" (not "draft") when the model doesn't comply with the format --
// the safe default is a plain reply, not an unwanted dispatch draft.
function parsePressyoReply(raw) {
  const cleaned = (raw || "").trim();
  const firstLineBreak = cleaned.indexOf("\n");
  const firstLine = (firstLineBreak === -1 ? cleaned : cleaned.slice(0, firstLineBreak)).trim();

  if (/^TYPE:\s*draft/i.test(firstLine)) {
    let rest = cleaned.slice(firstLineBreak === -1 ? cleaned.length : firstLineBreak + 1).trimStart();
    let title = "Untitled Dispatch";
    let visualPrompt = undefined;

    // Parse optional TITLE: and PROMPT: headers in either order
    for (let i = 0; i < 2; i++) {
      const titleMatch = rest.match(/^TITLE:\s*(.+)(?:\r?\n|$)/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
        rest = rest.slice(titleMatch[0].length).trimStart();
        continue;
      }
      const promptMatch = rest.match(/^PROMPT:\s*(.+)(?:\r?\n|$)/i);
      if (promptMatch) {
        visualPrompt = promptMatch[1].trim().replace(/^["']|["']$/g, "");
        rest = rest.slice(promptMatch[0].length).trimStart();
      }
    }

    const content = rest.trim();
    if (content) {
      return { type: "draft", title, text: content, visualPrompt };
    }
  }

  if (/^TYPE:\s*visual/i.test(firstLine)) {
    let rest = cleaned.slice(firstLineBreak === -1 ? cleaned.length : firstLineBreak + 1).trimStart();
    let visualPrompt = "";
    const promptMatch = rest.match(/^PROMPT:\s*(.+)(?:\r?\n|$)/i);
    if (promptMatch) {
      visualPrompt = promptMatch[1].trim().replace(/^["']|["']$/g, "");
      rest = rest.slice(promptMatch[0].length).trim();
    } else {
      visualPrompt = rest.split(/\r?\n/)[0].trim().replace(/^["']|["']$/g, "");
    }
    const explanation = rest || `Visual framing prompt ready: "${visualPrompt}"`;
    return {
      type: "visual",
      text: explanation,
      visualPrompt
    };
  }

  if (/^TYPE:\s*chat/i.test(firstLine)) {
    const rest = cleaned.slice(firstLineBreak === -1 ? cleaned.length : firstLineBreak + 1).trim();
    return { type: "chat", text: rest || cleaned };
  }

  // No recognized header at all -- model ignored the format. Return the
  // raw text as plain chat rather than guessing it's a draft.
  return { type: "chat", text: cleaned };
}

function parseLeadsReply(raw, allowedUrls) {
  const cleaned = (raw || "").trim();
  const allowed = new Set(allowedUrls);
  let jsonPart = cleaned;
  const leadsHeader = cleaned.match(/^TYPE:\s*leads\s*\n/i);
  if (leadsHeader) {
    jsonPart = cleaned.slice(leadsHeader[0].length).trim();
  }
  try {
    const parsed = JSON.parse(jsonPart);
    const list = Array.isArray(parsed) ? parsed : parsed?.leads;
    if (!Array.isArray(list)) return { type: "leads", leads: [] };
    const leads = list
      .map((item) => ({
        angle: String(item.angle || item.title || "").trim(),
        sourceUrl: String(item.sourceUrl || item.url || "").trim(),
        sourceTitle: String(item.sourceTitle || item.source || "").trim(),
      }))
      .filter((l) => l.angle && l.sourceUrl && allowed.has(l.sourceUrl))
      .slice(0, 8);
    return { type: "leads", leads };
  } catch {
    return { type: "leads", leads: [] };
  }
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .slice(-8)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      text: m.text.trim().slice(0, 1500)
    }));
}

async function tryOllama(systemPrompt, userPrompt, history = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const priorMessages = normalizeHistory(history).map((m) => ({
      role: m.role,
      content: m.text
    }));
    const headers = { "Content-Type": "application/json" };
    if (OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${OLLAMA_API_KEY}`;
    }
    const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          ...priorMessages,
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json();
    const text = data?.message?.content?.trim();
    if (!text) throw new Error("Ollama returned empty response");
    return { text, model: OLLAMA_MODEL };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGroq(systemPrompt, userPrompt, history = []) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);
  try {
    const priorMessages = normalizeHistory(history).map((m) => ({
      role: m.role,
      content: m.text
    }));
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.65,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          ...priorMessages,
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Groq HTTP ${resp.status}: ${errText.slice(0, 180)}`);
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Groq returned empty response");
    return { text, model: GROQ_MODEL };
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGemini(systemPrompt, userPrompt, history = []) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const priorContents = normalizeHistory(history).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...priorContents,
            { role: "user", parts: [{ text: userPrompt }] }
          ]
        })
      }
    );
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Gemini HTTP ${resp.status}: ${errText.slice(0, 200)}`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("Gemini returned empty response");
    return { text, model: GEMINI_MODEL };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const me = await getAuthenticatedAccount(req);
    if (!me) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const { prompt, editionStyle, editorAction, draftContext, history } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' string in request body" });
      return;
    }

    // Verify daily quota BEFORE calling upstream models so a 502 never
    // penalizes the reporter's daily allowance.
    const currentUsage = await getUsageToday(me.id);
    if (currentUsage >= DAILY_LIMIT) {
      res.status(429).json({
        error: `Daily Pressy'o limit reached (${DAILY_LIMIT}/day). Resets at midnight Central time.`
      });
      return;
    }

    const targetStyle = editionStyle || draftContext?.editionStyle || "tactical";

    if (editorAction === "find_leads") {
      const currentUsage = await getUsageToday(me.id);
      if (currentUsage >= DAILY_LIMIT) {
        res.status(429).json({
          error: `Daily assistant limit reached (${DAILY_LIMIT}/day). Resets at midnight Central time.`,
        });
        return;
      }

      const homeBureauLabel = draftContext?.homeBureauLabel || "Danville, IL";
      const filingLabel = draftContext?.location || draftContext?.filingLabel || homeBureauLabel;
      const articles = await fetchLeadSourceArticles({
        homeBureauLabel,
        filingLabel,
      });

      if (articles.length === 0) {
        res.status(200).json({
          type: "leads",
          leads: [],
          text: "No verified headlines were available right now. Try again later or search Explore for local sources.",
          remainingQuota: Math.max(0, DAILY_LIMIT - currentUsage),
        });
        return;
      }

      const catalog = articles
        .map((a, i) => `[${i + 1}] TITLE: ${a.title}\nURL: ${a.url}\nSNIPPET: ${a.snippet || ""}`)
        .join("\n\n");
      const allowedUrls = articles.map((a) => a.url);

      const leadsSystem = `You are Pressy'o, a literary journalism mentor. Suggest story angles for a local reporter.
RULES:
- Use ONLY the SOURCE URLs listed below. Copy each URL exactly. Never invent links, quotes, or facts.
- Each lead must include: angle (1-2 sentences), sourceUrl (exact match from catalog), sourceTitle.
- Respond with first line TYPE: leads then a JSON array: [{"angle":"...","sourceUrl":"https://...","sourceTitle":"..."}]
- If nothing is a good fit, return TYPE: leads and [].

HOME BUREAU: ${homeBureauLabel}
FILING FROM: ${filingLabel}

VERIFIED SOURCES:
${catalog}`;

      let text;
      try {
        const r1 = await tryOllama(leadsSystem, prompt, history);
        text = r1.text;
      } catch {
        try {
          const r2 = await tryGroq(leadsSystem, prompt, history);
          text = r2.text;
        } catch {
          const r3 = await tryGemini(leadsSystem, prompt, history);
          text = r3.text;
        }
      }
      const usedToday = await incrementUsage(me.id);
      const parsedLeads = parseLeadsReply(text, allowedUrls);
      res.status(200).json({
        ...parsedLeads,
        remainingQuota: Math.max(0, DAILY_LIMIT - usedToday),
      });
      return;
    }

    if (editorAction === "suggest_image_accessibility") {
      const captionAltSystem = buildCaptionAltSystemPrompt(draftContext || {});
      let text;
      try {
        const r1 = await tryOllama(captionAltSystem, prompt, history);
        text = r1.text;
      } catch {
        try {
          const r2 = await tryGroq(captionAltSystem, prompt, history);
          text = r2.text;
        } catch {
          const r3 = await tryGemini(captionAltSystem, prompt, history);
          text = r3.text;
        }
      }
      const usedToday = await incrementUsage(me.id);
      const parsed = parseCaptionAltReply(text);
      if (!parsed.ok) {
        res.status(502).json({
          error: "Could not parse caption and alt text suggestion.",
          type: "caption_alt",
          raw: text?.slice(0, 800),
          remainingQuota: Math.max(0, DAILY_LIMIT - usedToday),
        });
        return;
      }
      res.status(200).json({
        type: "caption_alt",
        caption: parsed.caption,
        altText: parsed.altText,
        remainingQuota: Math.max(0, DAILY_LIMIT - usedToday),
      });
      return;
    }

    const systemPrompt = buildSystemPrompt(targetStyle, editorAction, draftContext);

    // 3-Tier LLM Failover Cascade:
    //   1. Ollama (self-hosted / Cloudflare Tunnel / Ollama Cloud)
    //   2. Groq   (ultra-low-latency Llama 3.3 LPU)
    //   3. Gemini (high-availability Google Cloud fallback)
    let text, source, modelUsed;
    const providerErrors = {};

    try {
      const r1 = await tryOllama(systemPrompt, prompt, history);
      text = r1.text;
      modelUsed = r1.model;
      source = "ollama";
    } catch (ollamaErr) {
      providerErrors.ollama = ollamaErr?.message || String(ollamaErr);
      try {
        const r2 = await tryGroq(systemPrompt, prompt, history);
        text = r2.text;
        modelUsed = r2.model;
        source = "groq";
      } catch (groqErr) {
        providerErrors.groq = groqErr?.message || String(groqErr);
        try {
          const r3 = await tryGemini(systemPrompt, prompt, history);
          text = r3.text;
          modelUsed = r3.model;
          source = "gemini";
        } catch (geminiErr) {
          providerErrors.gemini = geminiErr?.message || String(geminiErr);
          res.status(502).json({
            error: "All 3 LLM tiers (Ollama → Groq → Gemini) failed to respond",
            providerErrors
          });
          return;
        }
      }
    }

    // Only charge quota after a model actually succeeds
    const usedToday = await incrementUsage(me.id);

    const parsed = parsePressyoReply(text);
    res.status(200).json({
      ...parsed,
      style: parsed.type === "draft" ? targetStyle : undefined,
      source,
      model: modelUsed,
      remainingQuota: Math.max(0, DAILY_LIMIT - usedToday)
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}
