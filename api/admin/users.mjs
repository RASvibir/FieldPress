// Lists all accounts for the admin panel. Super-admin only.
//
// GET /api/admin/users

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const caller = await getAuthenticatedAccount(req);
    if (!caller) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    if (caller.role !== "super_admin") {
      res.status(403).json({ error: "Super admin access required." });
      return;
    }

    const rows = await sql`
      SELECT id, email, callsign, name, bureau, avatar_url, role, created_at
      FROM fieldpress_accounts
      ORDER BY created_at ASC;
    `;

    res.status(200).json({ users: rows });
  } catch (err) {
    console.error("Admin users list error:", err);
    res.status(500).json({ error: "Failed to load users." });
  }
}
