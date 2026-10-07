/** Fetch recent headline links from Google News RSS (real URLs only). */

const RSS_TIMEOUT_MS = 8000;

function buildQueries(homeLabel, filingLabel) {
  const places = [filingLabel, homeLabel].filter(Boolean);
  const unique = [...new Set(places.map((p) => String(p).replace(/\(.*\)/, "").trim()).filter((p) => p.length > 2))];
  return unique.slice(0, 2).map((p) => `${p} local news`);
}

function extractItems(xml, limit = 12) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(xml)) && items.length < limit) {
    const block = m[1];
    const titleM = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkM = block.match(/<link>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+)(?:\]\]>)?<\/link>/i);
    const descM = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : "";
    const url = linkM ? linkM[1].trim() : "";
    const snippet = descM ? descM[1].replace(/<[^>]+>/g, "").trim().slice(0, 280) : "";
    if (title && url.startsWith("http")) {
      items.push({ title, url, snippet });
    }
  }
  return items;
}

export async function fetchLeadSourceArticles({ homeBureauLabel, filingLabel }) {
  const queries = buildQueries(homeBureauLabel, filingLabel);
  const all = [];
  for (const q of queries) {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), RSS_TIMEOUT_MS);
      const res = await fetch(rssUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "FieldPress-LeadSearch/1.0" },
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const xml = await res.text();
      all.push(...extractItems(xml, 8));
    } catch {
      // try next query
    }
  }
  const seen = new Set();
  return all.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 16);
}
