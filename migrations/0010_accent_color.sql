-- Persists the Press Pass "Badge Accent Trim" color server-side so it
-- survives across devices/browsers, instead of living only in
-- localStorage. Previously the value was silently dropped by
-- /api/auth/update-profile, which meant it looked saved in the current
-- browser but reverted anywhere else.
ALTER TABLE fieldpress_accounts
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(16) NOT NULL DEFAULT 'amber';
