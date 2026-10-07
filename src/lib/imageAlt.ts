/** Published <img alt>: explicit alt text, then caption, then headline. */
export function resolveImageAlt(
  altText?: string | null,
  caption?: string | null,
  headline?: string | null
): string {
  const alt = (altText || "").trim();
  if (alt) return alt.slice(0, 500);
  const cap = (caption || "").trim();
  if (cap) return cap.slice(0, 500);
  const head = (headline || "").trim();
  if (head) return head.slice(0, 500);
  return "Photo";
}
