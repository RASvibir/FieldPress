import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyItemsTable, draftsTable } from "@workspace/db";
import { eq, desc, sql, and, isNull, or } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard", async (req: Request, res: Response) => {
  const owned = req.user
    ? or(eq(storiesTable.ownerId, req.user.id), eq(storiesTable.visibility, "public"), isNull(storiesTable.ownerId))
    : or(eq(storiesTable.visibility, "public"), isNull(storiesTable.ownerId));
  const [totalStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(owned);
  const [activeStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(and(owned, eq(storiesTable.status, "active")));
  const [archivedStories] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(and(owned, eq(storiesTable.status, "archived")));
  const [totalItems] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storyItemsTable)
    .innerJoin(storiesTable, eq(storyItemsTable.storyId, storiesTable.id))
    .where(owned);
  const [totalDrafts] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(draftsTable)
    .innerJoin(storiesTable, eq(draftsTable.storyId, storiesTable.id))
    .where(owned);

  const recentStories = await db.select().from(storiesTable).where(owned).orderBy(desc(storiesTable.updatedAt)).limit(5);
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
