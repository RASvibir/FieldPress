// Pressy'o AI Newsroom Copilot — serverless endpoint.
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
    ? `\n\nCURRENT ACTIVE DRAFT IN PRESSIE BUILDER:
- Headline: ${draftContext.title || "(none)"}
- Edition Style: ${draftContext.editionStyle || styleName}
- Location/Corridor: ${draftContext.location || "Midwest Corridor"}
- Current Visual Prompt: ${draftContext.visualPrompt || "(none)"}
- Body:
${draftContext.content || "(empty)"}`
    : "";

  if (editorAction === "visual_prompt") {
    return `You are Pressy'o, the autonomous photojournalism director for FieldPress.
Your job is to craft a single vivid, high-detail visual generation prompt (for Pollinations / Flux photojournalism rendering) that matches the user's dispatch and the "${styleName}" edition aesthetic (${voice}).
Focus on concrete visual subjects, lighting, camera angle, lens texture, and atmosphere. Keep it under 45 words. Do not include camera brand trademarks or meta-commentary.

Respond in EXACTLY this format (nothing before TYPE:):
TYPE: visual
PROMPT: <the single-line visual generation prompt>${contextBlock}`;
  }

  if (editorAction === "headlines") {
    return `You are Pressy'o, the autonomous newsroom copilot for FieldPress.
Write a punchy, unforgettable headline for the current dispatch in the "${styleName}" edition voice (${voice}), and lightly polish the opening lede of the body if needed while preserving the full dispatch body.

Respond in EXACTLY this format (nothing before TYPE:):
TYPE: draft
TITLE: <the new headline>
PROMPT: <a concise 1-sentence photojournalism visual prompt matching the dispatch>
<the dispatch body>${contextBlock}`;
  }

  if (editorAction === "rewrite_voice" || editorAction === "expand" || editorAction === "shorten" || editorAction === "factcheck_polish" || editorAction === "draft_from_topic" || editorAction === "social_thread" || editorAction === "uplift_angle" || editorAction === "custom_edit") {
    const actionInstructions = {
      rewrite_voice: `Rewrite the current dispatch headline and body completely into the "${styleName}" edition voice (${voice}). Preserve all core facts, locations, and telemetry while transforming the diction, pacing, and structure to unmistakably match the "${styleName}" edition style.`,
      expand: `Expand and enrich the current dispatch in the "${styleName}" edition voice (${voice}). Add vivid journalistic detail, infrastructure/corridor context, and stronger narrative pacing (aim for 2-3 rich paragraphs) while staying grounded in the original premise.`,
      shorten: `Tighten and condense the current dispatch into high-signal, punchy wire copy in the "${styleName}" edition voice (${voice}). Cut fluff, sharpen verbs, and keep only the most impactful details (aim for 1 tight paragraph or 3-5 crisp lines).`,
      factcheck_polish: `Polish the current dispatch for grammar, flow, internal consistency, and authentic telemetry terminology in the "${styleName}" edition voice (${voice}). Fix any awkward phrasing and sharpen the headline.`,
      draft_from_topic: `Draft a complete, compelling FieldPress dispatch from the provided headline/topic in the "${styleName}" edition voice (${voice}), complete with a strong headline, a Pollinations photojournalism visual prompt, and vivid dispatch copy.`,
      uplift_angle: `Reframe and enrich the current dispatch in the "${styleName}" edition voice (${voice}) to highlight constructive solutions, measurable civic/scientific progress, and human or ecological resilience—turning raw news into high-signal, shareable positive journalism.`,
      social_thread: `Append a ready-to-distribute "📣 SOCIAL WIRE & 15s BROADCAST READ" block at the bottom of the current dispatch in the "${styleName}" edition voice (${voice}), preserving the main story while adding a <280-char social hook and a 15-second spoken radio/podcast script.`,
      custom_edit: `Apply the user's editing instruction to the current dispatch while maintaining the "${styleName}" edition voice (${voice}). Return the updated headline, visual prompt, and full updated dispatch body.`
    };

    return `You are Pressy'o v3.0, the autonomous in-editor newsroom copilot for FieldPress (supporting 8 Pressie Edition Archetypes: tactical, newspaper, fieldnote, almanac, curio, comic, arcade, magazine; plus hybrid Real Archival Photo & AI Photojournalism workflows).
Task: ${actionInstructions[editorAction] || actionInstructions.custom_edit}

Respond in EXACTLY this format -- the very first line must be "TYPE: draft", nothing before it:
TYPE: draft
TITLE: <the updated or newly drafted headline>
PROMPT: <a vivid 1-sentence photojournalism visual prompt for this dispatch>
<the full updated dispatch body in this edition's voice: ${voice}>

No meta-commentary about being an AI.${contextBlock}`;
  }

  return `You are Pressy'o v3.0, the autonomous newsroom copilot for FieldPress, a citizen-journalism and national dispatch platform.
You master all 8 Pressie Edition Styles:
1. "tactical" (🛰️ Encrypted Tactical Wire)
2. "newspaper" (📰 1920s Broadsheet Edition)
3. "fieldnote" (🌿 Naturalist & Ecology Field Note)
4. "almanac" (🧭 Heritage & Perennial Farmer's Almanac)
5. "curio" (🎪 Offbeat Americana Zine & Oddity Column)
6. "comic" (💥 Graphic Novel / Comic Strip)
7. "arcade" (🕹️ 8-Bit Retro CRT Telemetry)
8. "magazine" (✨ Modern Sleek Editorial Gloss)

You also support FieldPress's Hybrid Visual Workflow (combining real archival/public-domain photography from Wikimedia/NASA/NPS with AI photojournalism renders) and multi-era curation (from breaking 2026 science, space, and conservation wins to retro heritage classics). Do not write full dispatch copy unless the user is asking you to draft, write, rewrite, or compose a dispatch/pressie/story.${contextBlock}

Decide which kind of reply this message needs, then respond in EXACTLY one of these three formats -- the very first line must be "TYPE: draft", "TYPE: visual", or "TYPE: chat", nothing before it:

If drafting or rewriting a dispatch:
TYPE: draft
TITLE: <a short headline>
PROMPT: <a vivid 1-sentence photojournalism visual prompt for Pollinations image generation>
<the dispatch body, written in this edition's voice: ${voice}>

If the user is specifically asking for an image/visual prompt only:
TYPE: visual
PROMPT: <the visual generation prompt>
<a brief 1-sentence explanation or archival photo search tip>

If just talking (anything else -- a question, feedback request, headline ideas list, brainstorm, small talk, clarifying question, etc.):
TYPE: chat
<a normal, direct, helpful reply -- no edition voice header required>

No meta-commentary about being an AI in any case.`;
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
