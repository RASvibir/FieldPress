-- Migration: 0005_blocks_schema
-- Adds a block mechanism for other users (messenger + cohorts). Closes
-- the gap identified in the Competitive & QA Handout (Section 3.5 /
-- GitHub issue #145): no block/mute mechanism existed anywhere in the
-- codebase.
--
-- Blocking is one-directional and does not require the other party's
-- consent (unlike cohorts). A blocked user is hidden from the blocker's
-- messenger contact list and cannot be messaged by the blocker while the
-- block is active. This migration only adds the relationship table --
-- enforcement lives in api/blocks/[action].mjs and the messenger UI.

CREATE TABLE IF NOT EXISTS fieldpress_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fieldpress_blocks_no_self CHECK (blocker_id != blocked_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fieldpress_blocks_pair
  ON fieldpress_blocks (blocker_id, blocked_id);

CREATE INDEX IF NOT EXISTS idx_fieldpress_blocks_blocked
  ON fieldpress_blocks (blocked_id);
