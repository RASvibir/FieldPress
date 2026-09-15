-- Migration: 0008_dispute_reactions_schema
-- Adds a real, server-backed table for the "Disputed" reaction only.
--
-- All other reactions (frontpage, signal, investigate, solidarity,
-- broadcast) remain client-side/localStorage -- they're social signals
-- with no downstream workflow. "Disputed" is different: it's a trust &
-- safety flag (see Competitive & QA Handout Section 3.5 / issues #146,
-- #175), and a moderation queue can't threshold on it meaningfully if
-- the count is per-browser and invisible to admins. This migration make
-- it a real per-account toggle so counts are consistent across devices
-- and visible server-side for the moderation queue (see api/reports
-- action=disputed).

CREATE TABLE IF NOT EXISTS fieldpress_dispute_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fieldpress_dispute_reactions_pair
  ON fieldpress_dispute_reactions (dispatch_id, account_id);

CREATE INDEX IF NOT EXISTS idx_fieldpress_dispute_reactions_dispatch
  ON fieldpress_dispute_reactions (dispatch_id);
