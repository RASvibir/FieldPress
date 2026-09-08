/**
 * FieldPress Community Ledger & Stripe Connect Express Integration
 * Implements lazy initialization to avoid build failures in worker / serverless contexts.
 */

interface StripeInstance {
  paymentIntents: {
    create: (params: any) => Promise<any>;
  };
  transfers: {
    create: (params: any) => Promise<any>;
  };
}

let _stripe: StripeInstance | null = null;

export function getStripeClient(): StripeInstance {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (!key) {
      console.warn('[FieldPress Ledger]: STRIPE_SECRET_KEY not set. Running in mock ledger mode.');
      // Mock client fallback for development / offline workstation test runs
      return {
        paymentIntents: {
          create: async (params: any) => ({
            id: `pi_mock_${Date.now()}`,
            client_secret: `seti_secret_${Date.now()}`,
            amount: params.amount,
            status: 'requires_payment_method',
          }),
        },
        transfers: {
          create: async (params: any) => ({
            id: `tr_mock_${Date.now()}`,
            amount: params.amount,
            destination: params.destination,
          }),
        },
      };
    }
    // Dynamic require for Stripe to preserve lazy import semantics
    const Stripe = require('stripe');
    _stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return _stripe!;
}

/**
 * Creates an escrow-free destination payment intent for a reader tipping a reporter directly.
 */
export async function createDirectReporterTip({
  amountCents,
  reporterStripeAccountId,
  reporterHandle,
}: {
  amountCents: number;
  reporterStripeAccountId: string;
  reporterHandle: string;
}) {
  const stripe = getStripeClient();
  return await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    payment_method_types: ['card'],
    application_fee_amount: 0, // 0% platform fee - 100% grassroots flow
    transfer_data: {
      destination: reporterStripeAccountId,
    },
    metadata: {
      platform: 'fieldpress',
      recipient_handle: reporterHandle,
      type: 'reader_tip',
    },
  });
}

/**
 * Settles an open beat bounty upon publishing of a verified corroboration dispatch.
 */
export async function settleBountyPayout({
  bountyId,
  claimantHandle,
  claimantStripeAccountId,
  amountCents,
}: {
  bountyId: string;
  claimantHandle: string;
  claimantStripeAccountId: string;
  amountCents: number;
}) {
  const stripe = getStripeClient();
  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency: 'usd',
    destination: claimantStripeAccountId,
    metadata: {
      platform: 'fieldpress',
      bounty_id: bountyId,
      claimant_handle: claimantHandle,
    },
  });

  return { success: true, transferId: transfer.id };
}
