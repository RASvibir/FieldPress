/** True when the URL is safe to put on an <img src> (https/http only; no data: blobs). */
export function isDisplayableImageUrl(url?: string | null): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith("data:")) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function pickDispatchImageUrl(
  imageUrl?: string | null,
  embedThumbnail?: string | null
): string | null {
  if (isDisplayableImageUrl(imageUrl)) return imageUrl!.trim();
  if (isDisplayableImageUrl(embedThumbnail)) return embedThumbnail!.trim();
  return null;
}
