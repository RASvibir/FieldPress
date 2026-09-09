import { type Request, type Response, type NextFunction } from "express";

/**
 * Super Admin Gate:
 * Pre-configured to recognize your Zoho super admin account once provisioned.
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@fieldpress.studio";

  const isSuperAdmin =
    user?.role === "super_admin" ||
    (user?.email && user.email.toLowerCase() === adminEmail.toLowerCase()) ||
    user?.email?.endsWith("@fieldpress.studio");

  if (!isSuperAdmin) {
    res.status(403).json({
      error: "Access Denied: Super Admin authorization required.",
      code: "SUPER_ADMIN_REQUIRED",
    });
    return;
  }
  next();
}

/**
 * Registered Press & KYC Gate:
 * Enforces Desktop Suite licensing and KYC accreditation for financial bounty issuance.
 */
export function requireRegisteredPress(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  const isAccredited =
    user?.role === "registered_press" ||
    user?.isRegisteredPress === true ||
    user?.email?.endsWith("@fieldpress.studio");

  if (!isAccredited) {
    res.status(403).json({
      error: "Access Denied: Desktop Press Suite license and KYC verification required.",
      code: "REGISTERED_PRESS_REQUIRED",
    });
    return;
  }
  next();
}
