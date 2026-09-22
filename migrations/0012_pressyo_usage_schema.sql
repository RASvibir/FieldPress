-- Migration: 0012_pressyo_usage_schema
-- Adds real, server-backed daily usage tracking for the Pressy'o AI
-- copilot endpoint (api/pressyo.mjs).
--
-- Previously api/pressyo.mjs had no authentication and no rate limiting
-- of any kind -- anonymous or authenticated callers could hit it in a
-- loop with no ceiling, and it falls through to a metered Gemini API key
-- whenever the self-hosted Ollama tunnel is unreachable. This table lets
-- the endpoint enforce a real per-account daily cap instead.
--
-- One row per (account_id, usage_date). usage_date is stored as the
-- America/Chicago calendar date (matching the existing "Chicago Midnight
-- Quota" convention used by the client-side visual-generation counter)
-- so the reset boundary is consistent across features. The endpoint
-- does an upsert-and-increment on each call and rejects once count
-- exceeds the configured limit.

CREATE TABLE IF NOT EXISTS fieldpress_pressyo_usage (
  account_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_pressyo_usage_date
  ON fieldpress_pressyo_usage (usage_date);
