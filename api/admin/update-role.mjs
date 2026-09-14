// Promotes or demotes an account's role. Super-admin only.
//
// POST /api/admin/update-role
// body: { accountId: string, role: "super_admin" | "correspondent" }
//
// Guardrails:
// - Caller must already be super_admin (checked via session, not client input)
// - Can't demote the last remaining super_admin (prevents total lockout)
// - Role is restricted to a known set of values

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../_lib/auth.mjs";

const sql = neon(process.env.DATABASE_URL);
const VALID_ROLES = new Set(["super_admin", "correspondent"]);

export default async function handler(req, res) {
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

    // Guardrail: don't allow demoting the last super_admin, or the platform
    // could end up with nobody able to manage roles at all.
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
