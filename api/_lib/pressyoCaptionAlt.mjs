/**
 * Parses Pressy'o suggest_image_accessibility replies.
 * Expected format:
 *   TYPE: caption_alt
 *   {"caption":"...","altText":"..."}
 */

export function parseCaptionAltReply(raw) {
  const cleaned = (raw || "").trim();
  if (!cleaned) {
    return { ok: false, error: "empty" };
  }

  const lines = cleaned.split(/\n/);
  const first = lines[0].trim();
  const body = lines.slice(1).join("\n").trim();

  if (!/^TYPE:\s*caption_alt/i.test(first)) {
    return { ok: false, error: "missing_type" };
  }

  const jsonMatch = body.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { ok: false, error: "missing_json" };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const caption = typeof parsed.caption === "string" ? parsed.caption.trim().slice(0, 500) : "";
    const altText = typeof parsed.altText === "string" ? parsed.altText.trim().slice(0, 500) : "";
    if (!caption && !altText) {
      return { ok: false, error: "empty_fields" };
    }
    return { ok: true, caption, altText };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}

export function buildCaptionAltSystemPrompt(draftContext) {
  const title = draftContext?.title || "";
  const content = draftContext?.content || "";
  const imagePrompt = draftContext?.imagePrompt || draftContext?.imageTitle || "";

  return `You are Pressy'o, a journalism assistant for FieldPress.
You write text only — never generate, edit, or describe image creation prompts for external tools.

Task: Suggest an optional photo caption (reader-facing, can be slightly editorial) and accessibility alt text (factual, concise, for screen readers — describe what is visible, not mood).

Use the draft headline, body, and any image context below. Do not invent people, places, or events not supported by the draft.

DRAFT HEADLINE:
${title || "(none)"}

DRAFT BODY:
${content || "(none)"}

IMAGE CONTEXT (prompt or title if any):
${imagePrompt || "(none)"}

Respond in EXACTLY this format (no other text before TYPE:):
TYPE: caption_alt
{"caption":"<string>","altText":"<string>"}`;
}
