// Consolidated admin endpoint — one serverless function handling all
// admin actions, routed by the [action] dynamic segment so URLs are
// unchanged:
//   GET  /api/admin/users
//   POST /api/admin/update-role
//   POST /api/admin/toggle-verified
//   POST /api/admin/suspend-account
//   POST /api/admin/reinstate-account
//   POST /api/admin/remove-dispatch
//
// Merged from two separate files purely to stay under Vercel's per-plan
// serverless function cap. Each handler below is otherwise unchanged.
//
// suspendAccount / reinstateAccount / removeDispatch are exported (not
// just used as local action handlers) so api/_lib/handlers/reports.mjs
// can call the exact same enforcement logic when a report is resolved,
// instead of duplicating the SQL/guards in two files.

import { neon } from "@neondatabase/serverless";
import { getAuthenticatedAccount } from "../auth.mjs";

const sql = neon(process.env.DATABASE_URL);
const VALID_ROLES = new Set(["super_admin", "correspondent"]);

async function requireSuperAdmin(req, res) {
  const caller = await getAuthenticatedAccount(req);
  if (!caller) {
    res.status(401).json({ error: "Not authenticated." });
    return null;
  }
  if (caller.role !== "super_admin") {
    res.status(403).json({ error: "Super admin access required." });
    return null;
  }
  return caller;
}

async function countSuperAdmins() {
  const [{ count }] = await sql`
    SELECT count(*)::int AS count FROM fieldpress_accounts WHERE role = 'super_admin';
  `;
  return count;
}

function logModerationAction({ action, targetType, targetId, reportId = null, performedBy, note = "" }) {
  return sql`
    INSERT INTO fieldpress_moderation_actions
      (action, target_type, target_id, report_id, performed_by, note)
    VALUES (${action}, ${targetType}, ${targetId}, ${reportId}, ${performedBy}, ${note});
  `;
}

// Suspends an account: flips status to 'suspended' (which makes every
// existing session for that account stop resolving in
// getAuthenticatedAccount immediately, see migration 0013) and, belt-
// and-braces, deletes their sessions outright so a later reinstate
// doesn't silently revive a stale token. Guards against suspending a
// super_admin (demote via update-role first, deliberately, same as the
// existing last-super_admin guard below) and against self-suspension.
//
// Returns the updated account row, or throws { status, message } shaped
// errors that both the standalone action and reports.mjs can turn into
// an HTTP response.
export async function suspendAccount({ targetAccountId, callerId, callerRole, reportId = null, note = "" }) {
  if (targetAccountId === callerId) {
    throw { status: 400, message: "Cannot suspend your own account." };
  }

  const rows = await sql`
    SELECT id, email, role, status FROM fieldpress_accounts WHERE id = ${targetAccountId} LIMIT 1;
  `;
  if (rows.length === 0) {
    throw { status: 404, message: "Account not found." };
  }
  const target = rows[0];

  if (target.role === "super_admin") {
    throw { status: 409, message: "Cannot suspend a super admin. Demote the role first if that's intended." };
  }
  if (target.status === "suspended") {
    throw { status: 409, message: "Account is already suspended." };
  }

  const [updated] = await sql`
    UPDATE fieldpress_accounts
    SET status = 'suspended'
    WHERE id = ${targetAccountId}
    RETURNING id, email, callsign, name, role, status;
  `;
  await sql`DELETE FROM fieldpress_sessions WHERE account_id = ${targetAccountId};`;
  await logModerationAction({
    action: "suspend_account",
    targetType: "user",
    targetId: targetAccountId,
    reportId,
    performedBy: callerId,
    note
  });

  console.log(`Account suspended: ${callerId} (role=${callerRole}) suspended ${updated.email}`);
  return updated;
}

export async function reinstateAccount({ targetAccountId, callerId, reportId = null, note = "" }) {
  const rows = await sql`
    SELECT id, email, status FROM fieldpress_accounts WHERE id = ${targetAccountId} LIMIT 1;
  `;
  if (rows.length === 0) {
    throw { status: 404, message: "Account not found." };
  }
  if (rows[0].status !== "suspended") {
    throw { status: 409, message: "Account is not currently suspended." };
  }

  const [updated] = await sql`
    UPDATE fieldpress_accounts
    SET status = 'active'
    WHERE id = ${targetAccountId}
    RETURNING id, email, callsign, name, role, status;
  `;
  await logModerationAction({
    action: "reinstate_account",
    targetType: "user",
    targetId: targetAccountId,
    reportId,
    performedBy: callerId,
    note
  });

  console.log(`Account reinstated: ${callerId} reinstated ${updated.email}`);
  return updated;
}

// Removes a dispatch outright (hard delete, matching the existing owner
// DELETE in api/dispatches.mjs — there's no soft-delete/tombstone concept
// anywhere else in the schema yet, so this stays consistent with that).
export async function removeDispatch({ dispatchId, callerId, reportId = null, note = "" }) {
  const rows = await sql`SELECT id, account_id, title FROM fieldpress_dispatches WHERE id = ${dispatchId} LIMIT 1;`;
  if (rows.length === 0) {
    throw { status: 404, message: "Dispatch not found (may already be removed)." };
  }

  await sql`DELETE FROM fieldpress_dispatches WHERE id = ${dispatchId};`;
  await logModerationAction({
    action: "remove_dispatch",
    targetType: "dispatch",
    targetId: dispatchId,
    reportId,
    performedBy: callerId,
    note
  });

  console.log(`Dispatch removed: ${callerId} removed dispatch ${dispatchId} (was owned by ${rows[0].account_id})`);
  return { id: dispatchId };
}

async function handleUsers(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

    const rows = await sql`
      SELECT id, email, callsign, name, bureau, avatar_url, role, verified_local, status, created_at
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
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

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
      const count = await countSuperAdmins();
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

// Toggles the "Verified Local Correspondent" badge on an account. This is
// independent of `role` -- a super_admin manually confirms a correspondent's
// local presence/identity, and the flag is purely cosmetic (a badge on the
// Press Pass card), so there's no "last verified account" guard like the
// one update-role has for the last super_admin.
async function handleToggleVerified(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

    const { accountId, verifiedLocal } = req.body || {};
    if (typeof accountId !== "string" || !accountId.trim()) {
      res.status(400).json({ error: "Missing accountId." });
      return;
    }
    if (typeof verifiedLocal !== "boolean") {
      res.status(400).json({ error: "verifiedLocal must be a boolean." });
      return;
    }

    const targetRows = await sql`
      SELECT id FROM fieldpress_accounts WHERE id = ${accountId} LIMIT 1;
    `;
    if (targetRows.length === 0) {
      res.status(404).json({ error: "Account not found." });
      return;
    }

    const [updated] = await sql`
      UPDATE fieldpress_accounts
      SET verified_local = ${verifiedLocal}
      WHERE id = ${accountId}
      RETURNING id, email, callsign, name, role, verified_local;
    `;

    console.log(`Verified-local change: ${caller.email} set ${updated.email} verified_local=${verifiedLocal}`);
    res.status(200).json({ account: updated });
  } catch (err) {
    console.error("Admin toggle-verified error:", err);
    res.status(500).json({ error: "Failed to update verified-local status." });
  }
}

async function handleSuspendAccount(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

    const { accountId, note } = req.body || {};
    if (typeof accountId !== "string" || !accountId.trim()) {
      res.status(400).json({ error: "Missing accountId." });
      return;
    }

    const updated = await suspendAccount({
      targetAccountId: accountId,
      callerId: caller.id,
      callerRole: caller.role,
      note: typeof note === "string" ? note : ""
    });
    res.status(200).json({ account: updated });
  } catch (err) {
    if (err?.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("Admin suspend-account error:", err);
    res.status(500).json({ error: "Failed to suspend account." });
  }
}

async function handleReinstateAccount(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

    const { accountId, note } = req.body || {};
    if (typeof accountId !== "string" || !accountId.trim()) {
      res.status(400).json({ error: "Missing accountId." });
      return;
    }

    const updated = await reinstateAccount({
      targetAccountId: accountId,
      callerId: caller.id,
      note: typeof note === "string" ? note : ""
    });
    res.status(200).json({ account: updated });
  } catch (err) {
    if (err?.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("Admin reinstate-account error:", err);
    res.status(500).json({ error: "Failed to reinstate account." });
  }
}

async function handleRemoveDispatch(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const caller = await requireSuperAdmin(req, res);
    if (!caller) return;

    const { dispatchId, note } = req.body || {};
    if (typeof dispatchId !== "string" || !dispatchId.trim()) {
      res.status(400).json({ error: "Missing dispatchId." });
      return;
    }

    const result = await removeDispatch({
      dispatchId,
      callerId: caller.id,
      note: typeof note === "string" ? note : ""
    });
    res.status(200).json({ dispatch: result });
  } catch (err) {
    if (err?.status) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error("Admin remove-dispatch error:", err);
    res.status(500).json({ error: "Failed to remove dispatch." });
  }
}

const ACTIONS = {
  users: handleUsers,
  "update-role": handleUpdateRole,
  "toggle-verified": handleToggleVerified,
  "suspend-account": handleSuspendAccount,
  "reinstate-account": handleReinstateAccount,
  "remove-dispatch": handleRemoveDispatch
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
