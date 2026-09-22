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

// Atomic upsert-and-increment: single round trip, no read-then-write race
// between concurrent requests from the same account. Returns the count
// *after* incrementing, so the caller can compare against DAILY_LIMIT.
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

const OLLAMA_URL = process.env.OLLAMA_URL || "https://ollama.fieldpress.studio";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_TIMEOUT_MS = 8000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const EDITION_VOICE = {
  newspaper: "1920s broadsheet newspaper: formal, authoritative, vintage wire-service diction. Prefer words like 'yesterday', 'according to', 'authorities confirm'.",
  comic: "punchy comic book panel: short exclamatory bursts, onomatopoeia (BAM, ZAP, KAPOW), a pulpy superhero-adjacent tone.",
  arcade: "retro 8-bit arcade game telemetry: ALL CAPS status lines, terse system-log phrasing, references to levels/missions/bosses.",
  magazine: "sleek modern lifestyle magazine: clean, confident, conversational, trend-aware.",
  tactical: "encrypted tactical field intelligence briefing: terse, clipped, coordinate/callsign-heavy, no flourish."
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
function buildSystemPrompt(editionStyle) {
  const voice = EDITION_VOICE[editionStyle] || EDITION_VOICE.tactical;
  return `You are Pressy'o, the autonomous newsroom copilot for FieldPress, a hyperlocal citizen-journalism platform. You can draft dispatches, but you're also a normal conversational assistant -- answer questions, brainstorm, give feedback, fact-check, or just chat when that's what's actually being asked for. Do not write dispatch copy unless the user is explicitly asking you to draft, write, or compose a dispatch/pressie/story.

Decide which kind of reply this message needs, then respond in EXACTLY one of these two formats -- the very first line must be either "TYPE: draft" or "TYPE: chat", nothing before it:

If drafting a dispatch (user explicitly asked for one):
TYPE: draft
TITLE: <a short headline>
<the dispatch body, written in this edition's voice: ${voice}>

If just talking (anything else -- a question, feedback request, brainstorm, small talk, clarifying question back to the user, etc.):
TYPE: chat
<a normal, direct, helpful reply -- no edition voice, no dispatch structure, no headline>

No meta-commentary about being an AI in either case.`;
}

// Parses the TYPE: header the model was instructed to emit. Falls back to
// "chat" (not "draft") when the model doesn't comply with the format --
// the safe default is a plain reply, not an unwanted dispatch draft.
function parsePressyoReply(raw) {
  const firstLineBreak = raw.indexOf("\n");
  const firstLine = (firstLineBreak === -1 ? raw : raw.slice(0, firstLineBreak)).trim();

  if (/^TYPE:\s*draft/i.test(firstLine)) {
    let rest = raw.slice(firstLineBreak === -1 ? raw.length : firstLineBreak + 1);
    const titleMatch = rest.match(/^\s*TITLE:\s*(.+)\r?\n?/i);
    let title = "Untitled Dispatch";
    if (titleMatch) {
      title = titleMatch[1].trim();
      rest = rest.slice(titleMatch[0].length);
    }
    const content = rest.trim();
    if (content) {
      return { type: "draft", title, text: content };
    }
    // Model said "draft" but gave us no body -- don't hand the client an
    // empty draft card, fall through to treating it as chat text instead.
  }

  if (/^TYPE:\s*chat/i.test(firstLine)) {
    const rest = raw.slice(firstLineBreak === -1 ? raw.length : firstLineBreak + 1).trim();
    return { type: "chat", text: rest || raw.trim() };
  }

  // No recognized header at all -- model ignored the format. Return the
  // raw text as plain chat rather than guessing it's a draft.
  return { type: "chat", text: raw.trim() };
}

async function tryOllama(systemPrompt, userPrompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
  try {
    const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json();
    const text = data?.message?.content?.trim();
    if (!text) throw new Error("Ollama returned empty response");
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function tryGemini(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }]
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
  return text;
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

    const { prompt, editionStyle } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' string in request body" });
      return;
    }

    // Charge the request against today's quota before doing any model
    // work. If this call itself pushes the count over the limit, reject
    // it -- so the account is capped at exactly DAILY_LIMIT successful
    // requests/day, not DAILY_LIMIT-1 checked-then-incremented ones.
    const usedToday = await incrementUsage(me.id);
    if (usedToday > DAILY_LIMIT) {
      res.status(429).json({
        error: `Daily Pressy'o limit reached (${DAILY_LIMIT}/day). Resets at midnight Central time.`
      });
      return;
    }

    const systemPrompt = buildSystemPrompt(editionStyle);
    let text, source, ollamaError;

    try {
      text = await tryOllama(systemPrompt, prompt);
      source = "ollama";
    } catch (err) {
      ollamaError = err?.message || String(err);
      try {
        text = await tryGemini(systemPrompt, prompt);
        source = "gemini";
      } catch (geminiErr) {
        res.status(502).json({
          error: "Both Ollama and Gemini failed to respond",
          ollamaError,
          geminiError: geminiErr?.message || String(geminiErr)
        });
        return;
      }
    }

    const parsed = parsePressyoReply(text);
    res.status(200).json({ ...parsed, style: parsed.type === "draft" ? (editionStyle || "tactical") : undefined, source });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}
