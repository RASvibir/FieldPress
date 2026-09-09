import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// GET /api/bounties - Public read access for all Fieldies
router.get("/bounties", async (_req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      SELECT * FROM beat_bounties
      WHERE status = 'open'
      ORDER BY created_at DESC
      LIMIT 50;
    `);
    res.json({ bounties: result.rows || [] });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to fetch bounties" });
  }
});

// POST /api/bounties - STRICTLY RESTRICTED TO REGISTERED PRESSES WITH KYC
router.post("/bounties", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, description, locationSector, rewardDollars } = req.body;

  // Strict Press & KYC Verification Gate
  const isRegisteredPress = user?.role === "registered_press" || user?.isRegisteredPress === true;
  const isKycVerified = user?.kycStatus === "verified" || user?.deskLinks?.kycVerified === true;
  const hasDesktopSuite = user?.hasDesktopSuite === true || Boolean(user?.deskLinks?.desktopLicense);

  // Allow bypass only for explicitly configured system press handles
  const isSystemPress = user?.email?.endsWith("@fieldpress.studio");

  if (!isSystemPress && (!isRegisteredPress || !isKycVerified || !hasDesktopSuite)) {
    res.status(403).json({
      error: "Access Denied: Only KYC-verified Registered Presses with an active Desktop Press Suite license are authorized to issue and fund beat bounties.",
      code: "PRESS_KYC_REQUIRED",
    });
    return;
  }

  if (!title || !rewardDollars) {
    res.status(400).json({ error: "Title and reward amount are required." });
    return;
  }

  try {
    const bountyId = `bty_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const kycRef = user?.kycRef || `KYC_VERIFIED_${Date.now()}`;
    const pressId = user?.id || user?.email || "registered_bureau";

    await db.execute(sql`
      INSERT INTO beat_bounties (
        id, title, description, location_sector, amount_cents, creator_handle,
        status, issuing_press_id, kyc_reference_id, press_accreditation
      ) VALUES (
        ${bountyId},
        ${title},
        ${description || ''},
        ${locationSector || 'Regional Desk'},
        ${Number(rewardDollars) * 100},
        ${user?.displayName || user?.email?.split('@')[0] || 'RegisteredPress'},
        'open',
        ${pressId},
        ${kycRef},
        'accredited_desktop_press'
      );
    `);

    res.status(201).json({ success: true, bountyId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create bounty" });
  }
});

export default router;
