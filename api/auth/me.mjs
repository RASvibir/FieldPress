import { neon } from "@neondatabase/serverless";
import { parseCookies, publicAccount, SESSION_COOKIE_NAME } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      res.status(200).json({ account: null });
      return;
    }

    const rows = await sql`
      SELECT a.id, a.email, a.callsign, a.name, a.bureau, a.avatar_url
      FROM fieldpress_sessions s
      JOIN fieldpress_accounts a ON a.id = s.account_id
      WHERE s.token = ${token} AND s.expires_at > now()
      LIMIT 1;
    `;

    if (rows.length === 0) {
      res.status(200).json({ account: null });
      return;
    }

    res.status(200).json({ account: publicAccount(rows[0]) });
  } catch (err) {
    res.status(200).json({ account: null });
  }
}
