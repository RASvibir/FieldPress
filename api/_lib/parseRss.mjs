// Minimal RSS 2.0 / Atom parser — no DOM available in the serverless
// runtime, so this is a deliberately small regex-based extractor rather
// than pulling in a dependency. Good enough for standard feed formats;
// malformed feeds are skipped, not crashed on.

function decodeEntities(str) {
  if (!str) return str;
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();
}

function grabTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeEntities(m[1]) : null;
}

function grabAtomLink(block) {
  const m = block.match(/<link[^>]+href=["']([^"']+)["']/i) || block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  return m ? decodeEntities(m[1]) : null;
}

export default function parseRss(xml) {
  if (typeof xml !== "string" || !xml.trim()) return [];

  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const itemTag = isAtom ? "entry" : "item";
  const items = [];
  const re = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)</${itemTag}>`, "gi");
  let match;

  while ((match = re.exec(xml)) !== null) {
    const block = match[1];
    const title = grabTag(block, "title");
    const link = isAtom ? grabAtomLink(block) : grabTag(block, "link");
    const description = grabTag(block, "description") || grabTag(block, "summary") || grabTag(block, "content");
    const pubDate = grabTag(block, "pubDate") || grabTag(block, "published") || grabTag(block, "updated");
    const guid = grabTag(block, "guid") || grabTag(block, "id") || link;

    if (!title || !link) continue;

    items.push({
      title: title.replace(/<[^>]+>/g, "").trim(),
      link: link.trim(),
      description: (description || "").replace(/<[^>]+>/g, "").trim(),
      pubDate: pubDate ? new Date(pubDate) : null,
      guid: guid || link
    });
  }

  return items;
}
