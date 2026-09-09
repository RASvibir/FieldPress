-- Neon PostgreSQL: Desktop Suite Licenses, Bureau Registry & Admin Audit Logs

-- 1. Desktop Suite Licenses (Crypto & Bank Wire rails tracking)
CREATE TABLE IF NOT EXISTS desktop_suite_licenses (
    license_id VARCHAR(64) PRIMARY KEY,
    organization_name TEXT NOT NULL,
    admin_email VARCHAR(128) NOT NULL,
    payment_rail VARCHAR(32) NOT NULL, -- 'crypto_usdc', 'bank_wire', 'stripe_connect'
    payment_reference TEXT NOT NULL, -- TxHash or Wire Ref #
    seats_allocated INT NOT NULL DEFAULT 3,
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'pending_verification', 'suspended'
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year')
);

-- 2. Official Bureau Registry
CREATE TABLE IF NOT EXISTS bureau_registry (
    bureau_id VARCHAR(64) PRIMARY KEY,
    name TEXT NOT NULL,
    corridor_sector VARCHAR(128) NOT NULL,
    coordinator_handle VARCHAR(64) NOT NULL,
    scanner_stream_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Regional Bureaus
INSERT INTO bureau_registry (bureau_id, name, corridor_sector, coordinator_handle) VALUES
('danville_junction', 'Danville Junction Bureau', 'Danville Junction Spur • Vermilion Line', 'ras.ip'),
('vermilion_corridor', 'Vermilion Rail Corridor Bureau', 'Vermilion Rail Line', 'Fieldy'),
('chicago_loop', 'Chicago Loop Central Desk', 'Chicago Loop Core', 'jordan')
ON CONFLICT (bureau_id) DO NOTHING;

-- 3. Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_handle VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL, -- 'approve_kyc', 'issue_license', 'stash_archive', 'ban_actor'
    target_entity_id VARCHAR(128) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licenses_admin ON desktop_suite_licenses (admin_email, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON admin_audit_logs (created_at DESC);
