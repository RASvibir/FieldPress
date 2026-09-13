import { neon } from "@neondatabase/serverless";
import { parseCookies, clearCookieHeader, SESSION_COOKIE_NAME } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
      await sql`DELETE FROM fieldpress_sessions WHERE token = ${token};`;
    }
    res.setHeader("Set-Cookie", clearCookieHeader());
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed." });
  }
}
