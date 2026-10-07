export type EditionLookId =
  | "tactical"
  | "newspaper"
  | "fieldnote"
  | "almanac"
  | "curio"
  | "comic"
  | "arcade"
  | "magazine";

export type LookOption = {
  id: EditionLookId;
  label: string;
  emoji: string;
};

/** Friendly names for the 8 edition looks (plan §D). */
export const LOOK_OPTIONS: LookOption[] = [
  { id: "tactical", label: "Night vision", emoji: "🛰️" },
  { id: "newspaper", label: "Classic paper", emoji: "📰" },
  { id: "fieldnote", label: "Field journal", emoji: "🌿" },
  { id: "almanac", label: "Old almanac", emoji: "🌾" },
  { id: "curio", label: "Curio zine", emoji: "🔮" },
  { id: "comic", label: "Comic", emoji: "💥" },
  { id: "arcade", label: "Retro arcade", emoji: "🕹️" },
  { id: "magazine", label: "Magazine gloss", emoji: "✨" },
];

export const TOPIC_OPTIONS = [
  "Field Dispatch",
  "Breaking Wire",
  "Infrastructure",
  "Civic Wire",
  "Transit",
  "Telecom",
  "Editorial",
] as const;
