-- Migration: 0004_reports_schema
-- Adds a basic report/flag intake mechanism for dispatches, comments, and
-- users. Closes the gap identified in the Competitive & QA Handout
-- (Section 3.5 / GitHub issues #144, #171): no report/flag mechanism
-- existed anywhere in the codebase.
--
-- Scope is intentionally an intake queue, not a full moderation system:
-- authenticated users can file a report against a target; super_admins
-- can list open reports and mark them reviewed/dismissed. No automated
-- action is taken on the reported content itself.
--
-- Dispatches and comments are not backed by their own Postgres tables
-- (see dispatch_share_meta migration notes), so target_id is a plain
-- TEXT reference to whatever client-side id was reported, rather than a
-- foreign key -- reporter_id is the only enforced relationship.

CREATE TABLE IF NOT EXISTS fieldpress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('dispatch', 'comment', 'user')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES fieldpress_accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_reports_target
  ON fieldpress_reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_fieldpress_reports_status
  ON fieldpress_reports (status, created_at);

CREATE INDEX IF NOT EXISTS idx_fieldpress_reports_reporter
  ON fieldpress_reports (reporter_id);
