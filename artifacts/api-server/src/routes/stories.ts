import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyItemsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  ListStoriesQueryParams,
  CreateStoryBody,
  ImportStoryBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

async function getStoryWithItems(storyId: string) {
  const story = await db.select().from(storiesTable).where(eq(storiesTable.id, storyId)).limit(1);
  if (!story.length) return null;
  const items = await db.select().from(storyItemsTable).where(eq(storyItemsTable.storyId, storyId)).orderBy(desc(storyItemsTable.createdAt));
  return { ...story[0], items };
}

router.get("/stories", async (req: Request, res: Response) => {
  const parsed = ListStoriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const statusFilter = parsed.data.status || undefined;

  const stories = statusFilter
    ? await db.select().from(storiesTable).where(eq(storiesTable.status, statusFilter)).orderBy(desc(storiesTable.updatedAt))
    : await db.select().from(storiesTable).orderBy(desc(storiesTable.updatedAt));

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
  const data = parsed.data;
  const id = data.id || generateId();
  const now = data.createdAt ? new Date(String(data.createdAt)) : new Date();

  await db.insert(storiesTable).values({
    id,
    title: data.title,
    status: data.status || "active",
    createdAt: now,
    updatedAt: now,
  });

  const result = await getStoryWithItems(id);
  res.status(201).json(result);
});

router.get("/stories/:storyId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const result = await getStoryWithItems(storyId);
  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(result);
});

router.delete("/stories/:storyId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
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
    title,
    status: "active",
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

  const result = await getStoryWithItems(storyId);
  res.status(201).json(result);
});

export default router;
