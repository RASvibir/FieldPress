import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { draftsTable, storiesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateDraftBody, UpdateDraftBody } from "@workspace/api-zod";
import { getAccessibleStory } from "../lib/auth";

const router: IRouter = Router();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

router.get("/stories/:storyId/drafts", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const owned = await getAccessibleStory(req.user?.id, storyId);
  if (!owned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const drafts = await db.select().from(draftsTable)
    .where(eq(draftsTable.storyId, storyId))
    .orderBy(desc(draftsTable.updatedAt));
  res.json(drafts);
});

router.post("/stories/:storyId/drafts", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const parsed = CreateDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const storyExists = await getAccessibleStory(req.user?.id, storyId);
  if (!storyExists) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const data = parsed.data;
  const id = generateId();
  const now = new Date();

  await db.insert(draftsTable).values({
    id,
    storyId,
    mode: data.mode,
    title: data.title || "",
    content: data.content || "",
    createdAt: now,
    updatedAt: now,
  });

  const draft = await db.select().from(draftsTable).where(eq(draftsTable.id, id)).limit(1);
  res.status(201).json(draft[0]);
});

router.get("/stories/:storyId/drafts/:draftId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const draftId = req.params.draftId as string;
  const owned = await getAccessibleStory(req.user?.id, storyId);
  if (!owned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const draft = await db.select().from(draftsTable)
    .where(and(eq(draftsTable.id, draftId), eq(draftsTable.storyId, storyId)))
    .limit(1);
  if (!draft.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(draft[0]);
});

router.put("/stories/:storyId/drafts/:draftId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const draftId = req.params.draftId as string;
  const owned = await getAccessibleStory(req.user?.id, storyId);
  if (!owned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const parsed = UpdateDraftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;

  await db.update(draftsTable).set(updates)
    .where(and(eq(draftsTable.id, draftId), eq(draftsTable.storyId, storyId)));

  const draft = await db.select().from(draftsTable)
    .where(and(eq(draftsTable.id, draftId), eq(draftsTable.storyId, storyId)))
    .limit(1);
  if (!draft.length) {
    res.status(404).json({ error: "Draft not found" });
    return;
  }
  res.json(draft[0]);
});

router.delete("/stories/:storyId/drafts/:draftId", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const draftId = req.params.draftId as string;
  const owned = await getAccessibleStory(req.user?.id, storyId);
  if (!owned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(draftsTable)
    .where(and(eq(draftsTable.id, draftId), eq(draftsTable.storyId, storyId)));
  res.status(204).end();
});

export default router;
