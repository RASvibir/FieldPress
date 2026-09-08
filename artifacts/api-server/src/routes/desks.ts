import { Router, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, organizationsTable, membershipsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "desk";
}

// 1. List authenticated user's desks
router.get("/desks", async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const rows = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        slug: organizationsTable.slug,
        plan: organizationsTable.plan,
        createdAt: organizationsTable.createdAt,
        role: membershipsTable.role,
      })
      .from(membershipsTable)
      .innerJoin(organizationsTable, eq(membershipsTable.organizationId, organizationsTable.id))
      .where(eq(membershipsTable.userId, req.user.id))
      .orderBy(desc(organizationsTable.createdAt));

    res.json(rows);
  } catch (err) {
    logger.error({ err, context: "list-desks" }, "Failed to fetch desks");
    res.status(500).json({ error: "Could not load desks" });
  }
});

// 2. Create a new collaborative desk
router.post("/desks", async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Sign in to create a collaborative bureau" });
    return;
  }

  const rawName = typeof req.body?.name === "string" ? (typeof req.body.name === 'string' ? req.body.name : Array.isArray(req.body.name) ? req.body.name[0] : String(req.body.name || '')).trim() : "";
  if (!rawName) {
    res.status(400).json({ error: "Provide a bureau or desk name" });
    return;
  }

  const baseSlug = slugify(rawName);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const slug = `${baseSlug}-${randomSuffix}`.slice(0, 80);
  const orgId = generateId();
  const membershipId = generateId();

  try {
    const [org] = await db
      .insert(organizationsTable)
      .values({
        id: orgId,
        name: rawName.slice(0, 200),
        slug,
        plan: "indie",
      })
      .returning();

    await db.insert(membershipsTable).values({
      id: membershipId,
      userId: req.user.id,
      organizationId: orgId,
      role: "owner",
    });

    res.status(201).json({
      ...org,
      role: "owner",
      inviteCode: org.slug,
      inviteUrl: `/join/${org.slug}`,
    });
  } catch (err) {
    logger.error({ err, context: "create-desk" }, "Failed to create desk");
    res.status(500).json({ error: "Could not create bureau desk" });
  }
});

// 3. Get bureau details for join preview card
router.get("/desks/:code", async (req: Request, res: Response) => {
  const rawCode = req.params.code;
  const code = (typeof rawCode === "string" ? rawCode : Array.isArray(rawCode) ? rawCode[0] : "").trim();
  if (!code) {
    res.status(400).json({ error: "Desk invite code required" });
    return;
  }

  try {
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(sql`${organizationsTable.slug} = ${code} OR ${organizationsTable.id} = ${code}`)
      .limit(1);

    if (!org) {
      res.status(404).json({ error: "Bureau desk not found" });
      return;
    }

    const [memberCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(membershipsTable)
      .where(eq(membershipsTable.organizationId, org.id));

    let isMember = false;
    let myRole: string | null = null;

    if (req.user) {
      const [membership] = await db
        .select()
        .from(membershipsTable)
        .where(
          and(
            eq(membershipsTable.organizationId, org.id),
            eq(membershipsTable.userId, req.user.id),
          ),
        )
        .limit(1);

      if (membership) {
        isMember = true;
        myRole = membership.role;
      }
    }

    res.json({
      desk: org,
      memberCount: memberCountRow?.count || 1,
      isMember,
      myRole,
      signedIn: Boolean(req.user),
    });
  } catch (err) {
    logger.error({ err, context: "get-desk-preview" }, "Failed to fetch desk preview");
    res.status(500).json({ error: "Could not load bureau details" });
  }
});

// 4. Onboard user via 1-click invite link
router.post("/desks/join/:code", async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Sign in to join this bureau desk", requiresAuth: true });
    return;
  }

  const rawCode = req.params.code;
  const code = (typeof rawCode === "string" ? rawCode : Array.isArray(rawCode) ? rawCode[0] : "").trim();
  if (!code) {
    res.status(400).json({ error: "Invite code required" });
    return;
  }

  try {
    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(sql`${organizationsTable.slug} = ${code} OR ${organizationsTable.id} = ${code}`)
      .limit(1);

    if (!org) {
      res.status(404).json({ error: "Bureau desk not found" });
      return;
    }

    const [existing] = await db
      .select()
      .from(membershipsTable)
      .where(
        and(
          eq(membershipsTable.organizationId, org.id),
          eq(membershipsTable.userId, req.user.id),
        ),
      )
      .limit(1);

    if (existing) {
      res.json({
        success: true,
        alreadyMember: true,
        role: existing.role,
        desk: org,
      });
      return;
    }

    const membershipId = generateId();
    await db.insert(membershipsTable).values({
      id: membershipId,
      userId: req.user.id,
      organizationId: org.id,
      role: "reporter",
    });

    res.status(201).json({
      success: true,
      alreadyMember: false,
      role: "reporter",
      desk: org,
    });
  } catch (err) {
    logger.error({ err, context: "join-desk" }, "Failed to join bureau desk");
    res.status(500).json({ error: "Could not join bureau desk" });
  }
});

export default router;
