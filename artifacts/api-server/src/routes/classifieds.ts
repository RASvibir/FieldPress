import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// GET /api/classifieds
router.get("/classifieds", async (req: Request, res: Response) => {
  const { category, corridor, q } = req.query;
  try {
    let query = "SELECT * FROM classified_listings WHERE status = 'active'";
    const params: any[] = [];

    if (category && category !== "all") {
      query += " AND category = $" + (params.length + 1);
      params.push(category);
    }
    if (corridor && corridor !== "all") {
      query += " AND corridor_sector ILIKE $" + (params.length + 1);
      params.push("%" + corridor + "%");
    }
    if (q) {
      query += " AND (title ILIKE $" + (params.length + 1) + " OR description ILIKE $" + (params.length + 1) + ")";
      params.push("%" + q + "%");
    }

    query += " ORDER BY created_at DESC LIMIT 60;";
    const result = await db.execute(sql.raw(query));
    res.json({ listings: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch classifieds" });
  }
});

// POST /api/classifieds
router.post("/classifieds", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, category, corridorSector, priceDollars, isTrade, description, photoUrl } = req.body;

  if (!title || !category || !description) {
    res.status(400).json({ error: "Title, category, and description are required." });
    return;
  }

  try {
    const id = "cls_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const handle = user?.displayName || user?.email?.split("@")[0] || "FieldReporter";
    const priceCents = priceDollars ? Math.round(Number(priceDollars) * 100) : 0;

    await db.execute(sql`
      INSERT INTO classified_listings (
        id, title, category, corridor_sector, price_cents, is_trade,
        description, contact_handle, photo_url, status
      ) VALUES (
        ${id},
        ${title},
        ${category},
        ${corridorSector || "Danville Junction Corridor"},
        ${priceCents},
        ${Boolean(isTrade)},
        ${description},
        ${handle},
        ${photoUrl || null},
        'active'
      );
    `);

    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to post classified" });
  }
});

export default router;
