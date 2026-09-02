import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyItemsTable } from "@workspace/db";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import {
  ListStoriesQueryParams,
  CreateStoryBody,
  ImportStoryBody,
} from "@workspace/api-zod";
import { getAccessibleStory } from "../lib/auth";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function getStoryWithItems(userId: string | undefined, storyId: string) {
  const story = await getAccessibleStory(userId, storyId);
  if (!story) return null;
  const items = await db.select().from(storyItemsTable).where(eq(storyItemsTable.storyId, storyId)).orderBy(desc(storyItemsTable.createdAt));
  return { ...story, items };
}

router.get("/stories", async (req: Request, res: Response) => {
  const parsed = ListStoriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const ownerId = req.user?.id;
  const statusFilter = parsed.data.status || undefined;
  const owned = ownerId
    ? or(eq(storiesTable.ownerId, ownerId), eq(storiesTable.visibility, "public"), isNull(storiesTable.ownerId))
    : or(eq(storiesTable.visibility, "public"), isNull(storiesTable.ownerId));

  const stories = statusFilter
    ? await db.select().from(storiesTable).where(and(owned, eq(storiesTable.status, statusFilter))).orderBy(desc(storiesTable.updatedAt))
    : await db.select().from(storiesTable).where(owned).orderBy(desc(storiesTable.updatedAt));

  const result = await Promise.all(
    stories.map(async (s) => {
      const items = await db.select().from(storyItemsTable).where(eq(storyItemsTable.storyId, s.id)).orderBy(desc(storyItemsTable.createdAt));
      return { ...s, items };
    })
  );
  res.json(result);
});

router.post("/stories", async (req: Request, res: Response) => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const privateDesk = Boolean((req.body as { private?: boolean })?.private);
  if (privateDesk && !req.user) {
    res.status(401).json({ error: "Sign in required to keep a story private" });
    return;
  }
  const data = parsed.data;
  const id = data.id || generateId();
  const now = data.createdAt ? new Date(String(data.createdAt)) : new Date();

  await db.insert(storiesTable).values({
    id,
    ownerId: privateDesk ? req.user!.id : req.user?.id ?? null,
    title: data.title,
    status: data.status || "active",
    visibility: privateDesk ? "private" : "public",
    nsfw: 0,
    createdAt: now,
    updatedAt: now,
  });

  const result = await getStoryWithItems(req.user?.id, id);
  res.status(201).json(result);
});

router.get("/stories/:storyId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const result = await getStoryWithItems(req.user?.id, storyId);
  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.delete("/stories/:storyId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const story = await getAccessibleStory(req.user?.id, storyId);
  if (!story) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (story.ownerId && story.ownerId !== req.user?.id) {
    res.status(403).json({ error: "Only the owner can delete this story" });
    return;
  }
  await db.delete(storiesTable).where(eq(storiesTable.id, storyId));
  res.status(204).end();
});

router.post("/stories/import", async (req: Request, res: Response) => {
  const parsed = ImportStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { title, items } = parsed.data;
  const storyId = generateId();
  const now = new Date();

  await db.insert(storiesTable).values({
    id: storyId,
    ownerId: req.user?.id ?? null,
    title,
    status: "active",
    visibility: "public",
    nsfw: 0,
    createdAt: now,
    updatedAt: now,
  });

  if (items.length > 0) {
    await db.insert(storyItemsTable).values(
      items.map((item) => ({
        id: generateId(),
        storyId,
        type: item.type,
        content: item.content,
        createdAt: now,
      }))
    );
  }

  const result = await getStoryWithItems(req.user?.id, storyId);
  res.status(201).json(result);
});

export default router;
