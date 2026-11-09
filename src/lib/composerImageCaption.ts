/** Legacy auto-captions we no longer write; hide on publish if still in old rows. */
const LEGACY_PLACEHOLDER_PATTERNS = [
  /^\[📸\s*Real Web Photo\]/i,
  /^\[🎥\s*Real Video Footage Frame\]/i,
  /^\[🎥\s*Shared Broadcast Footage\]/i,
  /^\[🔗\s*Source Photo via/i,
  /^Field media link$/i,
  /^Verified Video Still$/i,
  /^Verified YouTube Broadcast Still$/i,
  /^Video frame$/i,
  /^Source visual from parent dispatch$/i,
];

export function isLegacyComposerPlaceholderCaption(caption?: string | null): boolean {
  const t = (caption || "").trim();
  if (!t) return false;
  return LEGACY_PLACEHOLDER_PATTERNS.some((re) => re.test(t));
}

/** Caption persisted on publish — only explicit composer caption field. */
export function captionForPublish(userCaption: string): string | undefined {
  const t = userCaption.trim();
  return t || undefined;
}

/** Whether to show a caption under a photo on the public feed / reader. */
export function shouldShowPublicImageCaption(caption?: string | null): boolean {
  const t = (caption || "").trim();
  if (!t) return false;
  return !isLegacyComposerPlaceholderCaption(t);
}
