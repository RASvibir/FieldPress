import { Router } from "express";
import { db } from "../lib/db";
import { mediaAssets, stories } from "../../../lib/db/src/schema";
import { eq } from "drizzle-orm";
import { searchWikimediaCommons, synthesizeVisualPrompts } from "../lib/images";

export const imagesRouter = Router();

const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// 1. Search Archival Images
imagesRouter.post("/stories/:id/images/search", async (req, res) => {
  try {
    const storyId = req.params.id;
    const { query } = req.body;

    let headline = query;

    if (!headline && isUuid(storyId)) {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
      });
      headline = story?.headline;
    }

    const searchTerm = query || headline || "Journalism";
    const candidates = await searchWikimediaCommons(searchTerm, 8);

    return res.json({
      query: searchTerm,
      count: candidates.length,
      candidates,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to search images" });
  }
});

// 2. Generate Photojournalistic AI Visual Prompts
imagesRouter.post("/stories/:id/images/generate-prompt", async (req, res) => {
  try {
    const storyId = req.params.id;
    const { format = "article_hero", fieldNotes, headline: customHeadline } = req.body;

    let storyHeadline = customHeadline;
    let trendBrief: string | undefined;

    if (!storyHeadline && isUuid(storyId)) {
      const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
      });
      storyHeadline = story?.headline;
      trendBrief = (story as any)?.trendBrief;
    }

    const finalHeadline = storyHeadline || "Investigative Field Report";

    const prompts = await synthesizeVisualPrompts({
      headline: finalHeadline,
      trendBrief,
      fieldNotes,
      format,
    });

    return res.json({ prompts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate prompt" });
  }
});

// 3. Save Media Asset to Database
imagesRouter.post("/stories/:id/media-assets", async (req, res) => {
  try {
    const storyId = req.params.id;
    const body = req.body;

    const [inserted] = await db
      .insert(mediaAssets)
      .values({
        storyId,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl,
        width: body.width,
        height: body.height,
        aspectRatio: body.aspectRatio,
        sourceType: body.sourceType,
        sourceName: body.sourceName,
        sourcePageUrl: body.sourcePageUrl,
        author: body.author,
        license: body.license,
        licenseUrl: body.licenseUrl,
        attribution: body.attribution,
        originalDate: body.originalDate,
        caption: body.caption,
        promptUsed: body.promptUsed,
        rawMetadata: body.rawMetadata || {},
      })
      .returning();

    return res.status(201).json({ asset: inserted });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to save media asset" });
  }
});
