/**
 * Parses Pressy'o suggest_image_prompt replies (text-only visual brief for imbrgr).
 */

export function buildImagePromptSystemPrompt(draftContext = {}) {
  const title = draftContext.title || "";
  const content = draftContext.content || "";
  const location = draftContext.location || "";
  const edition = draftContext.editionStyle || "tactical";

  return `You are a journalism desk assistant helping a reporter brief an external image studio (imbrgr).
You output ONLY a concise image-generation prompt — no instructions to run DALL·E, no markdown, no preamble.

Reply in exactly this format:
TYPE: image_prompt
PROMPT: <one paragraph, 1–3 sentences, concrete visual scene, photorealistic or editorial illustration as fits the story; no text-in-image requests>

Context edition voice hint (${edition}): match tone of the story, not the typography.
Headline: ${title || "(none)"}
Body excerpt: ${content ? content.slice(0, 1200) : "(none)"}
Location: ${location || "(none)"}

Rules:
- Describe subject, setting, lighting, mood — what a photojournalist or illustrator would shoot/draw.
- No logos, watermarks, or on-image captions.
- Keep PROMPT under 400 characters.`;
}

export function parseImagePromptReply(raw) {
  if (!raw || typeof raw !== "string") return { ok: false };
  const promptMatch = raw.match(/PROMPT:\s*(.+)/is);
  if (!promptMatch) return { ok: false };
  let prompt = promptMatch[1].trim().replace(/^["']|["']$/g, "");
  const firstLine = prompt.split(/\r?\n/)[0].trim();
  prompt = firstLine.slice(0, 400);
  if (!prompt) return { ok: false };
  return { ok: true, prompt };
}
