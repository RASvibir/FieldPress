export type DraftMode = "article" | "social" | "podcast";

export type DistributePayload = {
  storyTitle: string;
  mode: DraftMode | "package";
  title: string;
  content: string;
};

const MODE_HEADING: Record<DraftMode | "package", string> = {
  article: "Article",
  social: "Social",
  podcast: "Podcast",
  package: "Dispatch",
};

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "fieldpress"
  );
}

export function buildPlainText(payload: DistributePayload) {
  const heading = payload.title.trim() || payload.storyTitle;
  return [heading, payload.content.trim()].filter(Boolean).join("\n\n");
}

export function buildMarkdown(payload: DistributePayload) {
  const heading = payload.title.trim() || payload.storyTitle;
  return `# ${heading}\n\n_${MODE_HEADING[payload.mode]} · FieldPress_\n\n${payload.content.trim()}\n`;
}

export function filenameFor(payload: DistributePayload, ext: "md" | "txt") {
  const base = slugify(payload.title || payload.storyTitle);
  const kind = payload.mode === "package" ? "dispatch" : payload.mode;
  return `${base}-${kind}.${ext}`;
}

export function firstShareChunk(text: string, max = 270) {
  const parts = text
    .split(/\n\s*---\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0] || text.trim();
  if (first.length <= max) return first;
  return `${first.slice(0, max - 1).trimEnd()}…`;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type SavePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<{
    createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>;
  }>;
};

export function canSaveToDisk() {
  return typeof window !== "undefined" && typeof (window as SavePickerWindow).showSaveFilePicker === "function";
}

export async function saveToDisk(payload: DistributePayload) {
  const picker = (window as SavePickerWindow).showSaveFilePicker;
  if (!picker) {
    downloadText(filenameFor(payload, "md"), buildMarkdown(payload), "text/markdown");
    return "downloaded";
  }
  const handle = await picker({
    suggestedName: filenameFor(payload, "md"),
    types: [
      {
        description: "Markdown",
        accept: { "text/markdown": [".md"] },
      },
    ],
  });
  const writable = await handle.createWritable();
  await writable.write(buildMarkdown(payload));
  await writable.close();
  return "saved";
}

export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(payload: DistributePayload) {
  const text = buildPlainText(payload);
  const file = new File([buildMarkdown(payload)], filenameFor(payload, "md"), {
    type: "text/markdown",
  });
  const withFiles = { title: payload.title || payload.storyTitle, text, files: [file] };
  if (navigator.canShare?.(withFiles)) {
    await navigator.share(withFiles);
    return;
  }
  await navigator.share({ title: payload.title || payload.storyTitle, text });
}

export const COMPOSE_TARGETS = [
  { id: "x", label: "X / Twitter", color: "text-neon" },
  { id: "threads", label: "Threads", color: "text-neon-yellow" },
  { id: "bluesky", label: "Bluesky", color: "text-cyan-300" },
  { id: "linkedin", label: "LinkedIn", color: "text-neon" },
  { id: "facebook", label: "Facebook", color: "text-neon-yellow" },
  { id: "reddit", label: "Reddit", color: "text-neon-red" },
  { id: "instagram", label: "Instagram", color: "text-neon-red" },
  { id: "whatsapp", label: "WhatsApp", color: "text-neon" },
  { id: "email", label: "Email", color: "text-neon-yellow" },
] as const;

export type ComposeTargetId = (typeof COMPOSE_TARGETS)[number]["id"];

export function composeUrl(target: ComposeTargetId, payload: DistributePayload) {
  const full = buildPlainText(payload);
  const short = firstShareChunk(full);
  const subject = payload.title.trim() || payload.storyTitle;
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://fieldpress.studio";
  switch (target) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(short)}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(short)}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(short)}`;
    case "linkedin":
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(full.slice(0, 3000))}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(short)}`;
    case "reddit":
      return `https://www.reddit.com/submit?title=${encodeURIComponent(subject.slice(0, 300))}&text=${encodeURIComponent(full.slice(0, 40000))}`;
    case "instagram":
      return "https://www.instagram.com/";
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(short)}`;
    case "email":
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(full.slice(0, 1800))}`;
  }
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
