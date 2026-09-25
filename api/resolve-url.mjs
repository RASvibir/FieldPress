// GET /api/resolve-url?url=https://...
// Resolves a dropped/pasted URL from the Pressie Builder Title bar into:
//   { title, description, image, siteName, embedType, embedData, canonicalUrl }
// Uses api/_lib/resolveEmbed.mjs (which enforces assertSafeUrl SSRF protection).

import resolveEmbed from "./_lib/resolveEmbed.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawUrl =
    req.method === "POST"
      ? (req.body?.url || "")
      : (req.query?.url || "");

  if (typeof rawUrl !== "string" || !/^https?:\/\//i.test(rawUrl.trim())) {
    res.status(400).json({ error: "Valid http/https URL required." });
    return;
  }

  const targetUrl = rawUrl.trim().slice(0, 2000);

  try {
    const resolved = await resolveEmbed(targetUrl);
    if (!resolved || !resolved.embed_data) {
      let fallbackHost = "External Source";
      try {
        fallbackHost = new URL(targetUrl).hostname.replace(/^www\./, "");
      } catch {
        // ignore
      }
      res.status(200).json({
        ok: true,
        url: targetUrl,
        title: `Shared Dispatch via ${fallbackHost}`,
        description: "",
        image: null,
        siteName: fallbackHost,
        embedType: null,
        embedData: null
      });
      return;
    }

    const ed = resolved.embed_data;
    const title = ed.title || `Shared Dispatch via ${ed.site_name || ed.provider_name || "Web Source"}`;
    const description = ed.description || "";
    const image = ed.image || ed.thumbnail_url || null;
    const siteName = ed.site_name || ed.provider_name || "External Source";

    res.status(200).json({
      ok: true,
      url: ed.url || targetUrl,
      title,
      description,
      image,
      siteName,
      embedType: resolved.embed_type,
      embedData: ed
    });
  } catch (err) {
    console.error("resolve-url error:", err);
    res.status(200).json({
      ok: false,
      url: targetUrl,
      title: "",
      description: "",
      image: null
    });
  }
}
