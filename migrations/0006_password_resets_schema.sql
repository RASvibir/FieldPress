-- Migration: 0006_password_resets_schema
-- Adds password-reset support (GitHub issue #150). No reset flow existed
-- anywhere in the codebase; a locked-out user had no recovery path.
--
-- Tokens are single-use, short-lived, and stored only as a SHA-256 hash
-- (never the raw token) so a DB read alone can't be used to reset an
-- account. Enforcement lives in api/auth/[action].mjs
-- (request-reset / reset-password actions).

CREATE TABLE IF NOT EXISTS fieldpress_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_password_resets_account
  ON fieldpress_password_resets (account_id);

CREATE INDEX IF NOT EXISTS idx_fieldpress_password_resets_token_hash
  ON fieldpress_password_resets (token_hash);
