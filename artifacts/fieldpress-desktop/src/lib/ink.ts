export const INKS = [
  { id: "cool", label: "Cool", hint: "That’s a like." },
  { id: "love", label: "Love", hint: "Heart this." },
  { id: "lol", label: "LOL", hint: "That’s funny." },
  { id: "whoa", label: "Whoa", hint: "Didn’t see that coming." },
  { id: "iconic", label: "Iconic", hint: "That’s the one." },
  { id: "same", label: "Same", hint: "Felt that." },
  { id: "mad", label: "Mad", hint: "That’s messed up." },
] as const;

export type InkId = (typeof INKS)[number]["id"];

const ALIASES: Record<string, InkId> = {
  gall: "mad",
  heat: "iconic",
  salt: "same",
  spark: "cool",
  lead: "same",
  hush: "love",
  awesome: "iconic",
  funny: "lol",
  fire: "iconic",
  lit: "iconic",
  like: "cool",
  wow: "whoa",
  wait: "whoa",
  wild: "whoa",
};

export function parseInk(value: unknown): InkId | null {
  const id = String(value || "").trim().toLowerCase();
  if (INKS.some((ink) => ink.id === id)) return id as InkId;
  return ALIASES[id] || null;
}

export function inkLabel(id: string | null | undefined) {
  const parsed = parseInk(id);
  return INKS.find((ink) => ink.id === parsed)?.label || null;
}

export function pressieShareUrl(storyId: string, origin = "https://fieldpress.studio") {
  return `${origin.replace(/\/$/, "")}/s/${storyId}`;
}

export function pressieProvenance(storyId?: string, origin?: string) {
  const line = "— Pressie · FieldPress";
  if (!storyId) return line;
  return `${line}\n${pressieShareUrl(storyId, origin)}`;
}
