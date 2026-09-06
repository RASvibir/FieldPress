import express, { Router, type Request, type Response } from "express";
import {
  searchArchivalMedia,
  synthesizePhotoPrompt,
  WikimediaRateLimitError,
} from "../lib/images";
import { getOwnedStory } from "../lib/auth";
import { logger } from "../lib/logger";

export const imagesRouter = Router();

imagesRouter.use(express.json());

const FORMAT_IDS = new Set(["article_hero", "social_feed", "podcast_square"]);
const STYLE_IDS = new Set([
  "documentary_still",
  "editorial_illustration",
  "archival_poster",
  "collage",
  "zine_texture",
  "quiet_portrait",
  "abstract_signal",
  "polaroid",
  "hd",
  "toon",
  "fantasy",
  "sketch",
  "abstract",
]);

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validStoryId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 128;
}

async function requireAccessibleStory(req: Request, res: Response) {
  const storyId = req.params.id;
  if (!validStoryId(storyId)) {
    res.status(400).json({ error: "Invalid Pressie" });
    return null;
  }
  if (!req.user?.id) {
    res.status(401).json({ error: "Sign in required" });
    return null;
  }

  const story = await getOwnedStory(req.user.id, storyId);
  if (!story) {
    res.status(404).json({ error: "Pressie not found" });
    return null;
  }

  return story;
}

function safeFailure(res: Response, message: string, err: unknown, context: string) {
  logger.warn({ err, context }, message);
  return res.status(500).json({ error: message });
}

imagesRouter.get("/images/quota", async (_req: Request, res: Response) => {
  res.status(503).json({
    error: "Visual rendering is not configured on this FieldPress desk",
  });
});

imagesRouter.post("/stories/:id/images/search", async (req: Request, res: Response) => {
  const story = await requireAccessibleStory(req, res);
  if (!story) return;

  const query = text(req.body?.query, 240);
  if (!query) {
    res.status(400).json({ error: "Enter a search query" });
    return;
  }

  try {
    const results = await searchArchivalMedia(query);
    res.json(results);
  } catch (err) {
    if (err instanceof WikimediaRateLimitError) {
      logger.warn({ context: "archival-image-search", upstream: "wikimedia" }, err.message);
      res.status(503).json({
        error: err.message,
        code: "UPSTREAM_RATE_LIMITED",
        retryable: true,
      });
      return;
    }

    safeFailure(res, "Archival media search is unavailable. Try again.", err, "archival-image-search");
  }
});

imagesRouter.post("/stories/:id/images/generate-prompt", async (req: Request, res: Response) => {
  const story = await requireAccessibleStory(req, res);
  if (!story) return;

  const format = text(req.body?.format, 40) || "social_feed";
  const headline = text(req.body?.headline, 240) || story.title;
  const fieldNotes = text(req.body?.fieldNotes, 8000);
  const style = text(req.body?.style, 80) || "documentary_still";

  if (!FORMAT_IDS.has(format) || !STYLE_IDS.has(style)) {
    res.status(400).json({ error: "Choose a supported visual direction and format" });
    return;
  }
  if (!headline) {
    res.status(400).json({ error: "Add a headline before making a visual brief" });
    return;
  }

  try {
    const result = synthesizePhotoPrompt({ format, headline, fieldNotes });
    const basePrompt = text((result as { prompt?: unknown })?.prompt, 1080);
    const prompt = text(
      `${basePrompt}${basePrompt ? " " : ""}Editorial direction: ${style.replace(/_/g, " ")}.`,
      1200,
    );
    if (!prompt) {
      res.status(503).json({ error: "Pressy could not make a visual brief right now" });
      return;
    }
    res.json({ prompt, source: "fallback" });
  } catch (err) {
    safeFailure(res, "Pressy could not make a visual brief right now", err, "visual-brief");
  }
});

imagesRouter.post("/stories/:id/images/generate", async (req: Request, res: Response) => {
  const story = await requireAccessibleStory(req, res);
  if (!story) return;

  const prompt = text(req.body?.prompt, 1200);
  if (!prompt) {
    res.status(400).json({ error: "Write or generate a visual brief before rendering" });
    return;
  }

  res.status(503).json({
    error: "Visual rendering is not configured on this FieldPress desk",
  });
});

export default imagesRouter;
