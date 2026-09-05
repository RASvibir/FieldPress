type HistoryTurn = { role: string; content: string };

const OLLAMA_BASES = ["/ollama", "http://127.0.0.1:11434", "http://localhost:11434"];

const PREFERRED = ["llama3.3", "llama3.2", "llama3.1", "qwen2.5", "qwen3", "mistral", "gemma3", "gemma2", "phi4", "mixtral", "llama3"];

function pickModel(names: string[]): string {
  for (const want of PREFERRED) {
    const hit = names.find((name) => name === want || name.startsWith(`${want}:`) || name.startsWith(`${want}-`));
    if (hit) return hit;
  }
  return names[0] || "llama3.2";
}

async function ollamaAt(base: string): Promise<{ base: string; model: string } | null> {
  try {
    const response = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(1200) });
    if (!response.ok) return null;
    const data = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
    const names = (data.models || []).map((row) => row.name || row.model || "").filter(Boolean);
    if (!names.length) return { base, model: "llama3.2" };
    return { base, model: pickModel(names) };
  } catch {
    return null;
  }
}

async function findOllama(): Promise<{ base: string; model: string } | null> {
  for (const base of OLLAMA_BASES) {
    const hit = await ollamaAt(base);
    if (hit) return hit;
  }
  return null;
}

function pressyPrompt(message: string, history: HistoryTurn[]): string {
  const turns = history
    .slice(-12)
    .map((turn) => `${turn.role === "pressy" || turn.role === "model" ? "Pressy" : "Reporter"}: ${turn.content}`)
    .join("\n");
  return `You are Pressy, the FieldPress assignment editor. Complete sentences. Do not invent facts. A Pressie is the written piece. You are the bot.
Prior chat:
${turns || "(none)"}
Reporter: ${message}
Reply as Pressy only. Plain text.`;
}

export async function askLocalDesk(prompt: string): Promise<{ text: string; desk: string } | null> {
  const ollama = await findOllama();
  if (!ollama) return null;
  try {
    const response = await fetch(`${ollama.base}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model: ollama.model,
        stream: false,
        messages: [{ role: "user", content: prompt }],
        options: { temperature: 0.4, num_predict: 900 },
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { message?: { content?: string }; response?: string };
    const text = (data.message?.content || data.response || "").trim();
    if (!text) return null;
    return { text, desk: `ollama:${ollama.model}` };
  } catch {
    return null;
  }
}

export async function askPressy(message: string, history: HistoryTurn[] = []): Promise<{ reply: string; desk?: string }> {
  const local = await askLocalDesk(pressyPrompt(message, history));
  if (local) return { reply: local.text, desk: local.desk };
  const res = await fetch("/api/pressy", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const body = (await res.json().catch(() => ({}))) as { reply?: string; error?: string; desk?: string };
  if (!res.ok) throw new Error(body.error || "Pressy could not answer");
  return { reply: body.reply || "…", desk: body.desk };
}
