import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { storyItemsTable, storiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddStoryItemBody } from "@workspace/api-zod";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

router.post("/stories/:storyId/items", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const parsed = AddStoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const id = data.id || generateId();
  const now = data.createdAt ? new Date(String(data.createdAt)) : new Date();

  const storyExists = await db.select({ id: storiesTable.id }).from(storiesTable).where(eq(storiesTable.id, storyId)).limit(1);
  if (!storyExists.length) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  await db.insert(storyItemsTable).values({
    id,
    storyId,
    type: data.type,
    content: data.content,
    createdAt: now,
  });

  await db.update(storiesTable).set({ updatedAt: new Date() }).where(eq(storiesTable.id, storyId));

  const item = await db.select().from(storyItemsTable).where(eq(storyItemsTable.id, id)).limit(1);
  res.status(201).json(item[0]);
});

router.delete("/stories/:storyId/items/:itemId", async (req: Request, res: Response) => {
  const { storyId, itemId } = req.params;
  await db.delete(storyItemsTable).where(
    and(eq(storyItemsTable.id, itemId), eq(storyItemsTable.storyId, storyId))
  );
  res.status(204).end();
});

export default router;
