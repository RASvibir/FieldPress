-- Migration: 0007_notifications_schema
-- Adds a real, server-backed notifications system (GitHub issue #168).
--
-- The existing "notifications" bell in the client was comments-only and
-- entirely localStorage-derived (both the comments themselves and the
-- seen/unseen tracking), so it didn't sync across devices and covered
-- only one of the events users actually expect a notification center to
-- surface. This migration adds v1 scope: cohort requests and cohort
-- acceptances, since those are the only notification-worthy events that
-- are currently backed by a real Postgres table with a server-side write
-- path to trigger from (api/cohorts/[action].mjs). Comments remain
-- localStorage-only for now and are intentionally excluded until they
-- have their own server-side table and write path.

CREATE TABLE IF NOT EXISTS fieldpress_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cohort_request', 'cohort_accepted')),
  cohort_request_id UUID REFERENCES fieldpress_cohort_requests(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_notifications_recipient
  ON fieldpress_notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fieldpress_notifications_unread
  ON fieldpress_notifications (recipient_id, read_at);
