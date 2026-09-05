export const INKS = [
  { id: "cool", emoji: "🤠", label: "Cool", hint: "A good Pressie." },
  { id: "whoa", emoji: "📡", label: "Signal", hint: "Worth tracking." },
  { id: "iconic", emoji: "🔥", label: "Heat", hint: "This is moving." },
  { id: "love", emoji: "🫡", label: "Respect", hint: "Respect the work.", supportsTone: true },
  { id: "same", emoji: "🧠", label: "Brainwave", hint: "That clicks." },
  { id: "lol", emoji: "🪩", label: "Vibe", hint: "The energy is right." },
  { id: "mad", emoji: "✊", label: "Power", hint: "Stand with it.", supportsTone: true },
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

  signal: "whoa",
  respect: "love",
  brainwave: "same",
  vibe: "lol",
  power: "mad",
};

export function parseInk(value: unknown): InkId | null {
  const id = String(value || "").trim().toLowerCase();
  if (INKS.some((ink) => ink.id === id)) return id as InkId;
  return ALIASES[id] || null;
}

export function getInk(id: string | null | undefined) {
  const parsed = parseInk(id);
  return INKS.find((ink) => ink.id === parsed) || null;
}

export function inkLabel(id: string | null | undefined) {
  return getInk(id)?.label || null;
}

export function inkEmoji(id: string | null | undefined) {
  return getInk(id)?.emoji || "🤠";
}

export function pressieShareUrl(storyId: string, origin = "https://fieldpress.studio") {
  return `${origin.replace(/\/$/, "")}/s/${storyId}`;
}

export function pressieProvenance(storyId?: string, origin?: string) {
  const line = "— Pressie · FieldPress";
  if (!storyId) return line;
  return `${line}\n${pressieShareUrl(storyId, origin)}`;
}
