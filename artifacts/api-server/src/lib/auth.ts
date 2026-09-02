import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, sessionsTable, storiesTable, usersTable } from "@workspace/db";
import { sha256 } from "./crypto";

export const SESSION_COOKIE = "fp_session";
export const AGE_COOKIE = "fp_age";
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  ageBand?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function cookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_MS,
  };
}

export async function loadUserFromSession(req: Request): Promise<AuthUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || typeof token !== "string") return null;
  const tokenHash = sha256(token);
  const rows = await db
    .select({
      expiresAt: sessionsTable.expiresAt,
      userId: usersTable.id,
      email: usersTable.email,
      displayName: usersTable.displayName,
      status: usersTable.status,
      ageBand: usersTable.ageBand,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(eq(sessionsTable.tokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row || row.status !== "active" || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return { id: row.userId, email: row.email, displayName: row.displayName, ageBand: row.ageBand || "teen" };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await loadUserFromSession(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  req.user = user;
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  req.user = (await loadUserFromSession(req)) ?? undefined;
  next();
}

export function ageConfirmed(req: Request): boolean {
  return req.cookies?.[AGE_COOKIE] === "1" || req.headers["x-fieldpress-age"] === "1";
}

export async function getAccessibleStory(userId: string | undefined, storyId: string) {
  const rows = await db.select().from(storiesTable).where(eq(storiesTable.id, storyId)).limit(1);
  const story = rows[0];
  if (!story) return null;
  const visibility = (story as { visibility?: string }).visibility || "public";
  if (visibility === "private") {
    return userId && story.ownerId === userId ? story : null;
  }
  return story;
}

export async function getOwnedStory(userId: string, storyId: string) {
  return getAccessibleStory(userId, storyId);
}

export async function requireOwnedStory(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const storyId = req.params.storyId as string | undefined;
  if (!storyId) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const story = await getAccessibleStory(user?.id, storyId);
  if (!story) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
}
