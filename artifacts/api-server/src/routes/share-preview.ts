import { Router, type IRouter, type Request, type Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db, storiesTable, storyItemsTable } from "@workspace/db";

const router: IRouter = Router();

const PUBLIC_ORIGIN = "https://fieldpress.studio";
const TEXT_TYPES = new Set(["text", "body", "note", "caption", "quote", "markdown"]);
const IMAGE_TYPES = new Set(["image", "photo", "hero", "media"]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanText(value: unknown): string {
  return String(value || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isSafeShareExcerpt(value: string): boolean {
  const text = value.trim();
  if (!text) return false;

  return !(
    /^(?:\/Users\/|\/tmp\/|file:|https?:\/\/)/i.test(text) ||
    text.includes("WKFileShare-")
  );
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

const renderSharePreview = async (req: Request, res: Response) => {
  const storyId = String(req.params.id || "").trim();

  if (!storyId || storyId.length > 255) {
    unavailable(res);
    return;
  }

  try {
    const [story] = await db
      .select({
        id: storiesTable.id,
        title: storiesTable.title,
      })
      .from(storiesTable)
      .where(
        and(
          eq(storiesTable.id, storyId),
          eq(storiesTable.status, "active"),
        ),
      )
      .limit(1);

    if (!story) {
      unavailable(res);
      return;
    }

    const items = await db
      .select({
        type: storyItemsTable.type,
        content: storyItemsTable.content,
      })
      .from(storyItemsTable)
      .where(eq(storyItemsTable.storyId, story.id))
      .orderBy(asc(storyItemsTable.createdAt))
      .limit(12);

    const firstText = items
      .filter((item) => TEXT_TYPES.has(String(item.type || "").toLowerCase()))
      .map((item) => cleanText(item.content))
      .find(isSafeShareExcerpt);

    const firstImage = items
      .filter((item) => IMAGE_TYPES.has(String(item.type || "").toLowerCase()))
      .map((item) => String(item.content || "").trim())
      .find((value) => /^https:\/\/[^\s]+$/i.test(value) && /\.(avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(value));

    const title = escapeHtml(String(story.title || "FieldPress Pressie").slice(0, 160));
    const description = escapeHtml((firstText || "Read this Pressie on FieldPress.").slice(0, 280));
    const share = `${PUBLIC_ORIGIN}/s/${encodeURIComponent(story.id)}`;
    const open = `${PUBLIC_ORIGIN}/story/${encodeURIComponent(story.id)}`;
    const image = escapeHtml(firstImage || `${PUBLIC_ORIGIN}/opengraph.jpg`);

    res
      .status(200)
      .set({
        "Cache-Control": "public, max-age=300, s-maxage=300",
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
<meta property="og:url" content="${share}"/>
<meta property="og:image" content="${image}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${image}"/>
<link rel="canonical" href="${open}"/>
<meta http-equiv="refresh" content="2;url=${open}"/>
</head><body style="background:#000;color:#f5f5f5;font-family:system-ui,sans-serif;padding:2rem">
<main><p>Opening Pressie…</p><h1>${title}</h1><p>${description}</p><p><a href="${open}" style="color:#39ff14">Open this Pressie in FieldPress</a></p></main>
</body></html>`);
  } catch {
    unavailable(res);
  }
};

router.get("/s/:id", renderSharePreview);
router.get("/share/:id", renderSharePreview);
router.get("/api/share/:id", renderSharePreview);

export default router;
