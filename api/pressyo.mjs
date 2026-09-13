// Pressy'o AI Newsroom Copilot — serverless endpoint.
//
// Strategy: try local Ollama first (free, fast, runs on the publisher's own
// machine via a Cloudflare Tunnel at OLLAMA_URL) for cost/token budget, and
// fall back to Gemini (reliable, always-on) if Ollama is unreachable, times
// out, or isn't configured. The frontend never needs to know which one
// answered beyond the `source` field returned for transparency.

const OLLAMA_URL = process.env.OLLAMA_URL || "https://ollama.fieldpress.studio";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_TIMEOUT_MS = 8000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const EDITION_VOICE = {
  newspaper: "Write in the voice of a 1920s broadsheet newspaper: formal, authoritative, vintage wire-service diction. Prefer words like 'yesterday', 'according to', 'authorities confirm'.",
  comic: "Write like a punchy comic book panel: short exclamatory bursts, onomatopoeia (BAM, ZAP, KAPOW), a pulpy superhero-adjacent tone.",
  arcade: "Write like retro 8-bit arcade game telemetry: ALL CAPS status lines, terse system-log phrasing, references to levels/missions/bosses.",
  magazine: "Write like a sleek modern lifestyle magazine: clean, confident, conversational, trend-aware.",
  tactical: "Write like an encrypted tactical field intelligence briefing: terse, clipped, coordinate/callsign-heavy, no flourish."
};

function buildSystemPrompt(editionStyle) {
  const voice = EDITION_VOICE[editionStyle] || EDITION_VOICE.tactical;
  return `You are Pressy'o, the autonomous newsroom copilot for FieldPress, a hyperlocal citizen-journalism platform. ${voice} Keep responses grounded, concise, and usable as real dispatch copy — no meta-commentary about being an AI.`;
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
    const { prompt, editionStyle } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt' string in request body" });
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

    res.status(200).json({ text, source });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}
