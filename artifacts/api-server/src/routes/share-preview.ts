import { Router, type IRouter, type Request, type Response } from "express";
import {
  getPublicShareablePressie,
  normalizePublicPressieId,
} from "../lib/public-shareable-pressie";
import { renderPressieSocialCard as renderPressieSocialCardImage } from "../lib/pressie-social-card";

const router: IRouter = Router();

const PUBLIC_ORIGIN = "https://fieldpress.studio";
const PUBLIC_CARD_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=60";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unavailable(res: Response): void {
  const title = "Pressie unavailable — FieldPress";
  const description = "This Pressie is unavailable.";
  const image = `${PUBLIC_ORIGIN}/opengraph.jpg`;

  res
    .status(404)
    .set({
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    })
    .send(`<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex, nofollow"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${image}"/>
</head><body><p>This Pressie is unavailable.</p></body></html>`);
}

function unavailableCard(res: Response): void {
  res.status(404).set("Cache-Control", "no-store").end();
}

function sharePreviewError(res: Response): void {
  res
    .status(500)
    .set({
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    })
    .send("<!doctype html><html lang=\"en\"><head><meta name=\"robots\" content=\"noindex, nofollow\"/></head><body></body></html>");
}

const renderSharePreview = async (req: Request, res: Response) => {
  if (!normalizePublicPressieId(req.params.id)) {
    unavailable(res);
    return;
  }

  try {
    const pressie = await getPublicShareablePressie(req.params.id);

    if (!pressie) {
      unavailable(res);
      return;
    }

    const title = escapeHtml(pressie.title);
    const description = escapeHtml(pressie.excerpt || "Read this Pressie on FieldPress.");
    const canonical = `${PUBLIC_ORIGIN}/s/${encodeURIComponent(pressie.id)}`;
    const open = `${PUBLIC_ORIGIN}/story/${encodeURIComponent(pressie.id)}`;
    const image = `${PUBLIC_ORIGIN}/og/pressies/${encodeURIComponent(pressie.id)}.png`;

    res
      .status(200)
      .set({
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
        "Content-Type": "text/html; charset=utf-8",
      })
      .send(`<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} — FieldPress</title>
<meta name="description" content="${description}"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="FieldPress"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:type" content="image/png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${image}"/>
<link rel="canonical" href="${canonical}"/>
<meta http-equiv="refresh" content="2;url=${open}"/>
</head><body style="background:#000;color:#f5f5f5;font-family:system-ui,sans-serif;padding:2rem">
<main><p>Opening Pressie…</p><h1>${title}</h1><p>${description}</p><p><a href="${open}" style="color:#b8ff5a">Open this Pressie in FieldPress</a></p></main>
</body></html>`);
  } catch {
    sharePreviewError(res);
  }
};

const renderPressieSocialCard = async (req: Request, res: Response) => {
  if (!normalizePublicPressieId(req.params.id)) {
    unavailableCard(res);
    return;
  }

  try {
    const pressie = await getPublicShareablePressie(req.params.id);

    if (!pressie) {
      unavailableCard(res);
      return;
    }

    const image = renderPressieSocialCardImage({
      title: pressie.title,
      excerpt: pressie.excerpt,
    });

    res
      .status(200)
      .set({
        "Cache-Control": PUBLIC_CARD_CACHE_CONTROL,
        "Content-Type": "image/png",
        "Content-Length": String(image.byteLength),
        "X-Content-Type-Options": "nosniff",
      })
      .send(image);
  } catch {
    res.status(500).set("Cache-Control", "no-store").end();
  }
};

router.get("/og/pressies/:id.png", renderPressieSocialCard);
router.get("/api/og/pressies/:id.png", renderPressieSocialCard);
router.get("/s/:id", renderSharePreview);
router.get("/share/:id", renderSharePreview);
router.get("/api/share/:id", renderSharePreview);

export default router;
