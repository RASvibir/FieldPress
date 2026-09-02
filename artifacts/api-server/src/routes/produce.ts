import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { draftsTable, storiesTable, storyItemsTable } from "@workspace/db";
import { generateProducerDraft } from "../lib/gemini";
import { logger } from "../lib/logger";
import { getAccessibleStory } from "../lib/auth";

const router: IRouter = Router();

function readProduceBody(body: unknown): { title?: string; notes: string[] } {
  if (!body || typeof body !== "object") {
    return { notes: [] };
  }
  const record = body as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title : undefined;
  const notes = Array.isArray(record.notes)
    ? record.notes.filter((note): note is string => typeof note === "string")
    : [];
  return { title, notes };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function isNoteType(type: string): boolean {
  return type === "text" || type === "note";
}

async function upsertDrafts(
  storyId: string,
  drafts: Array<{ mode: "article" | "social" | "podcast"; title: string; content: string }>,
) {
  const saved = [];
  const now = new Date();

  for (const draft of drafts) {
    const existing = await db
      .select()
      .from(draftsTable)
      .where(and(eq(draftsTable.storyId, storyId), eq(draftsTable.mode, draft.mode)))
      .orderBy(desc(draftsTable.updatedAt))
      .limit(1);

    if (existing[0]) {
      await db
        .update(draftsTable)
        .set({ title: draft.title, content: draft.content, updatedAt: now })
        .where(eq(draftsTable.id, existing[0].id));
      const updated = await db
        .select()
        .from(draftsTable)
        .where(eq(draftsTable.id, existing[0].id))
        .limit(1);
      saved.push(updated[0]);
      continue;
    }

    const id = generateId();
    await db.insert(draftsTable).values({
      id,
      storyId,
      mode: draft.mode,
      title: draft.title,
      content: draft.content,
      createdAt: now,
      updatedAt: now,
    });
    const created = await db.select().from(draftsTable).where(eq(draftsTable.id, id)).limit(1);
    saved.push(created[0]);
  }

  return saved;
}

router.post("/produce", async (req: Request, res: Response) => {
  const parsed = readProduceBody(req.body);
  const title = parsed.title?.trim();
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const result = await generateProducerDraft({
      title,
      notes: parsed.notes,
    });
    res.json(result);
  } catch (err) {
    logger.error({ err }, "produce failed");
    res.status(502).json({ error: err instanceof Error ? err.message : "Producer failed" });
  }
});

router.post("/stories/:storyId/produce", async (req: Request, res: Response) => {
  const storyId = req.params.storyId as string;
  const story = await getAccessibleStory(req.user?.id, storyId);
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }

  const items = await db
    .select()
    .from(storyItemsTable)
    .where(eq(storyItemsTable.storyId, storyId));
  const notes = items.filter((item) => isNoteType(item.type)).map((item) => item.content);
  const audioCount = items.filter((item) => item.type === "audio").length;

  try {
    const result = await generateProducerDraft({
      title: story.title,
      notes,
      audioCount,
    });
    const drafts = await upsertDrafts(storyId, result.drafts);
    await db
      .update(storiesTable)
      .set({ updatedAt: new Date() })
      .where(eq(storiesTable.id, storyId));
    res.json({ ...result, drafts, usedFallback: false });
  } catch (err) {
    logger.error({ err }, "story produce failed");
    const notesText = notes.join("\n") || "No field notes yet.";
    const drafts = await upsertDrafts(storyId, [
      { mode: "article", title: `${story.title} — Field Report`, content: `# ${story.title}\n\n${notesText}` },
      { mode: "social", title: `${story.title} — Social`, content: notesText },
      { mode: "podcast", title: `${story.title} — Dispatch`, content: notesText },
    ]);
    res.json({
      summary: notes[0] || story.title,
      outline: ["What we know", "What still needs checking"],
      caption: story.title,
      drafts,
      usedFallback: true,
      error: "Live AI was unavailable, so FieldPress drafted from your notes instead.",
    });
  }
});

export default router;
