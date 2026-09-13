-- Migration: 0001_auth_schema
-- Creates fieldpress_accounts and fieldpress_sessions, matching api/auth/*.mjs and api/_lib/auth.mjs

CREATE TABLE IF NOT EXISTS fieldpress_accounts (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  callsign VARCHAR(32) NOT NULL,
  name VARCHAR(200) NOT NULL,
  bureau VARCHAR(200) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fieldpress_accounts_email_lower ON fieldpress_accounts (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_fieldpress_accounts_callsign_lower ON fieldpress_accounts (lower(callsign));

CREATE TABLE IF NOT EXISTS fieldpress_sessions (
  token TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_sessions_account_id ON fieldpress_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_fieldpress_sessions_expires_at ON fieldpress_sessions(expires_at);
