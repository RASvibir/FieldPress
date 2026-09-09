-- Neon PostgreSQL: Registered Press KYC & Bounty Governance
ALTER TABLE beat_bounties 
  ADD COLUMN IF NOT EXISTS issuing_press_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS kyc_reference_id VARCHAR(128),
  ADD COLUMN IF NOT EXISTS press_accreditation VARCHAR(64) DEFAULT 'registered_press',
  ADD COLUMN IF NOT EXISTS desktop_license_id VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_beat_bounties_press 
  ON beat_bounties (issuing_press_id, kyc_reference_id);
