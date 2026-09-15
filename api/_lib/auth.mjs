import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

export const SESSION_COOKIE_NAME = "fieldpress_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

let _sql = null;
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

// Resolves the requesting account (including role) from the session cookie.
// Returns null if there's no valid, unexpired session. Shared by any
// endpoint that needs to know who's calling and what they're allowed to do.
export async function getAuthenticatedAccount(req) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT a.id, a.email, a.callsign, a.name, a.bureau, a.avatar_url, a.role, a.verified_local
    FROM fieldpress_sessions s
    JOIN fieldpress_accounts a ON a.id = s.account_id
    WHERE s.token = ${token} AND s.expires_at > now()
    LIMIT 1;
  `;
  return rows.length > 0 ? rows[0] : null;
}

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Password-reset tokens are emailed to the user as the raw value but
// stored in the DB only as this hash, so a DB read can't be replayed as
// a valid reset link.
export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function sessionCookieHeader(token) {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookieHeader() {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

export function publicAccount(account) {
  if (!account) return null;
  const { id, email, callsign, name, bureau, avatar_url, role, verified_local } = account;
  // NOTE: client-side account objects use avatarUrl (camelCase) throughout
  // (authAccount state, applyAccountToPressPass, etc.) - this used to leak
  // the raw snake_case avatar_url here instead, which meant every login,
  // signup, and /api/auth/me call silently set pressPass.avatarUrl to
  // undefined, wiping the user's photo on every fresh page load.
  return { id, email, callsign, name, bureau, avatarUrl: avatar_url, role, verifiedLocal: !!verified_local };
}

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCallsign(callsign) {
  if (typeof callsign !== "string") return false;
  return /^[A-Za-z0-9._]{3,32}$/.test(callsign);
}
