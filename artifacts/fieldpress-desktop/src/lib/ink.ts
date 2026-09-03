export const INKS = [
  { id: "gall", label: "Gall", hint: "Bitter. Hold them to it." },
  { id: "heat", label: "Heat", hint: "Live. Still burning." },
  { id: "salt", label: "Salt", hint: "Grief, or the tenderness after." },
  { id: "spark", label: "Spark", hint: "Wonder. You saw something new." },
  { id: "lead", label: "Lead", hint: "Heavy. Grave. Do not look away." },
  { id: "hush", label: "Hush", hint: "Quiet. The room after the press." },
] as const;

export type InkId = (typeof INKS)[number]["id"];

export function parseInk(value: unknown): InkId | null {
  const id = String(value || "").trim().toLowerCase();
  return INKS.some((ink) => ink.id === id) ? (id as InkId) : null;
}

export function inkLabel(id: string | null | undefined) {
  return INKS.find((ink) => ink.id === id)?.label || null;
}

export function pressieShareUrl(storyId: string, origin = "https://fieldpress.studio") {
  return `${origin.replace(/\/$/, "")}/s/${storyId}`;
}

export function pressieProvenance(storyId?: string, origin?: string) {
  const line = "— Pressie · FieldPress";
  if (!storyId) return line;
  return `${line}\n${pressieShareUrl(storyId, origin)}`;
}
