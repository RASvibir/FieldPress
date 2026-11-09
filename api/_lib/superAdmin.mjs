/**
 * Owner-only admin console access. `role === super_admin` in the DB is not
 * sufficient — the account must also match SUPER_ADMIN_EMAIL (same env used
 * at signup). This prevents a mistakenly promoted correspondent from using
 * admin APIs even if their row still says super_admin.
 */

const OWNER_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "vibir@fieldpress.studio").toLowerCase();

export function getOwnerEmail() {
  return OWNER_EMAIL;
}

export function isSuperAdminAccount(account) {
  if (!account) return false;
  if (account.role !== "super_admin") return false;
  const email = (account.email || "").toLowerCase();
  return email === OWNER_EMAIL;
}

export async function requireOwnerSuperAdmin(req, res, getAuthenticatedAccount) {
  const caller = await getAuthenticatedAccount(req);
  if (!caller) {
    res.status(401).json({ error: "Not authenticated." });
    return null;
  }
  if (!isSuperAdminAccount(caller)) {
    res.status(403).json({ error: "Super admin access required." });
    return null;
  }
  return caller;
}
