import crypto from "crypto";

export const SESSION_COOKIE_NAME = "fieldpress_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
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
  const { id, email, callsign, name, bureau, avatar_url } = account;
  return { id, email, callsign, name, bureau, avatar_url };
}

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCallsign(callsign) {
  if (typeof callsign !== "string") return false;
  return /^[A-Za-z0-9._]{3,32}$/.test(callsign);
}
