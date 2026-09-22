-- Migration: 0013_moderation_enforcement_schema
-- Closes the gap flagged in the free-tier hardening audit: fieldpress_reports
-- (0004) is intake-only -- resolving a report never took any actual action
-- against the reported content or account. This migration adds:
--
-- 1. fieldpress_accounts.status -- 'active' | 'suspended'. A suspended
--    account's existing sessions stop resolving (see updated query in
--    api/_lib/auth.mjs getAuthenticatedAccount), which logs them out
--    everywhere immediately without needing to touch fieldpress_sessions
--    on every request.
-- 2. fieldpress_moderation_actions -- an audit log of every enforcement
--    action taken (suspend/reinstate/remove-dispatch), who did it, and
--    which report (if any) prompted it. Nothing in the product currently
--    records *why* an account was suspended or a dispatch removed; this
--    is the paper trail for that.
--
-- Enforcement itself lives in api/_lib/handlers/admin.mjs (suspendAccount /
-- reinstateAccount / removeDispatch), reused by both the standalone admin
-- actions and api/_lib/handlers/reports.mjs's resolve action.

ALTER TABLE fieldpress_accounts
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));

CREATE TABLE IF NOT EXISTS fieldpress_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('suspend_account', 'reinstate_account', 'remove_dispatch')),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'dispatch')),
  target_id TEXT NOT NULL,
  report_id UUID REFERENCES fieldpress_reports(id) ON DELETE SET NULL,
  performed_by TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_moderation_actions_target
  ON fieldpress_moderation_actions (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_fieldpress_moderation_actions_report
  ON fieldpress_moderation_actions (report_id);
