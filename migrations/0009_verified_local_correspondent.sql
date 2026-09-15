-- Adds the "Verified Local Correspondent" badge tier: an independent,
-- super_admin-granted flag (not a role) confirming a correspondent's
-- local presence/identity has been manually verified. Kept separate from
-- `role` since it's orthogonal -- a correspondent or a super_admin can
-- each independently be verified-local or not.
ALTER TABLE fieldpress_accounts
  ADD COLUMN IF NOT EXISTS verified_local BOOLEAN NOT NULL DEFAULT false;
