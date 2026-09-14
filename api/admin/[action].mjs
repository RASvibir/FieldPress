// Consolidated admin endpoint — one serverless function handling all
// admin actions, routed by the [action] dynamic segment so URLs are
// unchanged:
//   GET  /api/admin/users
//   POST /api/admin/update-role
//
// Merged from two separate files purely to stay under Vercel's per-plan
// serverless function cap. Each handler below is otherwise unchanged.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);
const VALID_ROLES = new Set(["super_admin", "correspondent"]);

async function handleUsers(req, res) {
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

async function handleUpdateRole(req, res) {
  if (req.method !== "POST") {
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

    const { accountId, role } = req.body || {};
    if (typeof accountId !== "string" || !accountId.trim()) {
      res.status(400).json({ error: "Missing accountId." });
      return;
    }
    if (!VALID_ROLES.has(role)) {
      res.status(400).json({ error: "Invalid role. Must be 'super_admin' or 'correspondent'." });
      return;
    }

    const targetRows = await sql`
      SELECT id, email, role FROM fieldpress_accounts WHERE id = ${accountId} LIMIT 1;
    `;
    if (targetRows.length === 0) {
      res.status(404).json({ error: "Account not found." });
      return;
    }
    const target = targetRows[0];

    if (target.role === "super_admin" && role !== "super_admin") {
      const [{ count }] = await sql`
        SELECT count(*)::int AS count FROM fieldpress_accounts WHERE role = 'super_admin';
      `;
      if (count <= 1) {
        res.status(409).json({ error: "Cannot demote the last remaining super admin." });
        return;
      }
    }

    const [updated] = await sql`
      UPDATE fieldpress_accounts
      SET role = ${role}
      WHERE id = ${accountId}
      RETURNING id, email, callsign, name, role;
    `;

    console.log(`Role change: ${caller.email} set ${updated.email} to role=${role}`);
    res.status(200).json({ account: updated });
  } catch (err) {
    console.error("Admin update-role error:", err);
    res.status(500).json({ error: "Failed to update role." });
  }
}

const ACTIONS = {
  users: handleUsers,
  "update-role": handleUpdateRole
};

export default async function handler(req, res) {
  const action = req.query?.action;
  const fn = typeof action === "string" ? ACTIONS[action] : undefined;
  if (!fn) {
    res.status(404).json({ error: "Unknown admin action." });
    return;
  }
  return fn(req, res);
}
