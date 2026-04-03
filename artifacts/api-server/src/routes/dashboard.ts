import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyItemsTable, draftsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (_req: Request, res: Response) => {
  const [totalStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable);
  const [activeStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(eq(storiesTable.status, "active"));
  const [archivedStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(eq(storiesTable.status, "archived"));
  const [totalItems] = await db.select({ count: sql<number>`count(*)::int` }).from(storyItemsTable);
  const [totalDrafts] = await db.select({ count: sql<number>`count(*)::int` }).from(draftsTable);

  const recentStories = await db.select().from(storiesTable).orderBy(desc(storiesTable.updatedAt)).limit(5);
  const recentWithItems = await Promise.all(
    recentStories.map(async (s) => {
      const items = await db.select().from(storyItemsTable).where(eq(storyItemsTable.storyId, s.id)).orderBy(desc(storyItemsTable.createdAt));
      return { ...s, items };
    })
  );

  res.json({
    totalStories: totalStories.count,
    activeStories: activeStories.count,
    archivedStories: archivedStories.count,
    totalItems: totalItems.count,
    totalDrafts: totalDrafts.count,
    recentStories: recentWithItems,
  });
});

export default router;
