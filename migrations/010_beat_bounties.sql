-- Neon PostgreSQL: Beat Bounties & Micro-Sponsorships
CREATE TABLE IF NOT EXISTS beat_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bureau_id VARCHAR(64) DEFAULT 'global',
    creator_handle VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_sector TEXT NOT NULL,
    amount_cents INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    status VARCHAR(32) NOT NULL DEFAULT 'open', -- 'open', 'claimed', 'settled', 'expired'
    claimed_by_handle VARCHAR(64),
    claimed_story_id VARCHAR(64),
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_beat_bounties_status 
    ON beat_bounties (status, bureau_id);
