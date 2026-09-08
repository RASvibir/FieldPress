import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// GET /api/ledger/bureau/:bureauId/status
router.get("/ledger/bureau/:bureauId/status", async (req: Request, res: Response) => {
  try {
    const { bureauId } = req.params;
    const result = await db.execute(
      sql`SELECT * FROM bureau_payout_profiles WHERE bureau_id = ${bureauId} LIMIT 1`
    );
    const profile = (result.rows || result)[0] as any;

    if (!profile) {
      return res.json({ connected: false, chargesEnabled: false });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    if (account.charges_enabled !== profile.charges_enabled) {
      await db.execute(
        sql`UPDATE bureau_payout_profiles 
            SET charges_enabled = ${account.charges_enabled}, 
                payouts_enabled = ${account.payouts_enabled}, 
                updated_at = NOW() 
            WHERE id = ${profile.id}`
      );
    }

    return res.json({
      connected: true,
      stripeAccountId: profile.stripe_account_id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/bureau/:bureauId/onboard
router.post("/ledger/bureau/:bureauId/onboard", async (req: Request, res: Response) => {
  try {
    const { bureauId } = req.params;
    const returnUrl = `${req.headers.origin || "https://fieldpress.studio"}/desk?bureau=${bureauId}&stripe_return=true`;

    const result = await db.execute(
      sql`SELECT * FROM bureau_payout_profiles WHERE bureau_id = ${bureauId} LIMIT 1`
    );
    const profile = (result.rows || result)[0] as any;
    let stripeAccountId = profile?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      await db.execute(
        sql`INSERT INTO bureau_payout_profiles (bureau_id, stripe_account_id, charges_enabled, payouts_enabled)
            VALUES (${bureauId}, ${stripeAccountId}, false, false)`
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return res.json({ url: accountLink.url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/tip
router.post("/ledger/tip", async (req: Request, res: Response) => {
  try {
    const { bureauId, storyId, amountCents, receiptSignature } = req.body;

    if (!bureauId || !amountCents || amountCents < 100) {
      return res.status(400).json({ error: "Invalid tip payload (min $1.00)" });
    }

    const result = await db.execute(
      sql`SELECT * FROM bureau_payout_profiles WHERE bureau_id = ${bureauId} LIMIT 1`
    );
    const profile = (result.rows || result)[0] as any;

    if (!profile || !profile.charges_enabled) {
      return res.status(400).json({ error: "Bureau payout rails not active." });
    }

    const platformFee = Math.round(amountCents * 0.05);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: profile.stripe_account_id,
      },
      metadata: {
        bureauId,
        storyId: storyId || "general",
        receiptSignature: receiptSignature || "unsigned",
      },
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
