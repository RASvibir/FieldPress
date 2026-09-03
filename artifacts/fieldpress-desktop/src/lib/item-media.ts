export function extractImageSrc(content: string, type?: string): string | null {
  const text = (content || "").trim();
  if (!text) return null;
  if (text.startsWith("data:image")) return text.split(/\s/)[0];
  const url = text.match(/https?:\/\/[^\s"'<>]+/i)?.[0];
  if (!url) return null;
  if (type === "photo") return url;
  if (/\.(jpe?g|png|gif|webp|avif|bmp)(\?|#|$)/i.test(url)) return url;
  if (
    /staticflickr|live\.staticflickr|upload\.wikimedia|wikimedia\.org|googleusercontent|ggpht|oaidalle|cloudflare|imagedelivery/i.test(
      url,
    )
  ) {
    return url;
  }
  return null;
}
