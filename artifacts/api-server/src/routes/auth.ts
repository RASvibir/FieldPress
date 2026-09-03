import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  passwordResetTokensTable,
  sessionsTable,
  usersTable,
} from "@workspace/db";
import {
  SESSION_COOKIE,
  cookieOptions,
  loadUserFromSession,
  type AuthUser,
} from "../lib/auth";
import { hashSecret, newId, sha256, verifySecret } from "../lib/crypto";
import { sendPasswordResetEmail } from "../lib/mail";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const registerBody = z.object({
  email: z.string().email().max(320),
  password: z.string().min(10).max(200),
  displayName: z.string().trim().min(1).max(200).optional(),
  resetWord: z.string().min(8).max(200).optional(),
  ageBand: z.enum(["kids", "teen", "adult", "under13", "teenager", "over18"]),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

const forgotBody = z.object({
  email: z.string().email(),
});

const resetBody = z
  .object({
    password: z.string().min(10).max(200),
    token: z.string().min(16).optional(),
    email: z.string().email().optional(),
    resetWord: z.string().min(8).optional(),
  })
  .refine((v) => Boolean(v.token) || (v.email && v.resetWord), {
    message: "Provide a reset link token or email plus desk word",
  });

function publicOrigin(): string {
  return (
    process.env.APP_URL ||
    process.env.PUBLIC_ORIGIN ||
    "https://fieldpress.studio"
  ).replace(/\/+$/, "");
}

function publicUser(user: AuthUser) {
  return { id: user.id, email: user.email, displayName: user.displayName, ageBand: user.ageBand || "teen" };
}

function parseAgeBand(value: string): "kids" | "teen" | "adult" {
  if (value === "kids" || value === "under13") return "kids";
  if (value === "adult" || value === "over18") return "adult";
  return "teen";
}

async function createSession(res: Response, userId: string) {
  const token = newId() + newId();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({
    id: newId(),
    userId,
    tokenHash: sha256(token),
    expiresAt,
  });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}

router.post("/auth/register", async (req: Request, res: Response) => {
  const parsed = registerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length) {
    res.status(409).json({ error: "An account with that email already exists" });
    return;
  }
  const id = newId();
  const displayName = parsed.data.displayName || email.split("@")[0] || "Reporter";
  await db.insert(usersTable).values({
    id,
    email,
    displayName,
    status: "active",
    passwordHash: await hashSecret(parsed.data.password),
    resetWordHash: parsed.data.resetWord ? await hashSecret(parsed.data.resetWord) : null,
    ageBand: parseAgeBand(parsed.data.ageBand),
  });
  await createSession(res, id);
  res.status(201).json({ user: { id, email, displayName, ageBand: parseAgeBand(parsed.data.ageBand) } });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const user = rows[0];
  if (!user || !user.passwordHash || !(await verifySecret(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (user.status !== "active") {
    res.status(403).json({ error: "Account is not active" });
    return;
  }
  await createSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName, ageBand: user.ageBand || "teen" } });
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, sha256(token)));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.status(204).end();
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const user = await loadUserFromSession(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  res.json({ user: publicUser(user) });
});

router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  const parsed = forgotBody.safeParse(req.body);
  if (!parsed.success) {
    res.json({ ok: true });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const user = rows[0];
  let resetUrl: string | undefined;
  if (user) {
    const token = newId() + newId();
    await db.insert(passwordResetTokensTable).values({
      id: newId(),
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    resetUrl = `${publicOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    if (process.env.NODE_ENV !== "production") {
      logger.info({ email }, "Password reset issued");
    }
  }
  const body: { ok: true; resetUrl?: string } = { ok: true };
  if (process.env.NODE_ENV !== "production" && resetUrl) {
    body.resetUrl = resetUrl;
  }
  res.json(body);
});

router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const parsed = resetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const passwordHash = await hashSecret(parsed.data.password);

  if (parsed.data.token) {
    const tokenHash = sha256(parsed.data.token);
    const rows = await db
      .select()
      .from(passwordResetTokensTable)
      .where(and(eq(passwordResetTokensTable.tokenHash, tokenHash), isNull(passwordResetTokensTable.usedAt)))
      .limit(1);
    const row = rows[0];
    if (!row || row.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ error: "Reset link is invalid or expired" });
      return;
    }
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, row.userId));
    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokensTable.id, row.id));
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, row.userId));
    await createSession(res, row.userId);
    res.json({ ok: true });
    return;
  }

  const email = parsed.data.email!.trim().toLowerCase();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const user = rows[0];
  if (!user?.resetWordHash || !(await verifySecret(parsed.data.resetWord!, user.resetWordHash))) {
    res.status(401).json({ error: "Email or desk word did not match" });
    return;
  }
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));
  await createSession(res, user.id);
  res.json({ ok: true });
});

export default router;
