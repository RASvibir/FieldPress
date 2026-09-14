-- Real account-to-account cohort connections, replacing the previous
-- client-only-fake cohort system (which let a user "establish a cohort
-- desk" out of typed-in text with no other real account involved).
--
-- A "cohort" relationship is represented purely by an accepted row in
-- fieldpress_cohort_requests -- there's no separate cohorts table to keep
-- in sync. Querying "my cohorts" = accepted rows where I'm requester or
-- recipient.

CREATE TABLE IF NOT EXISTS fieldpress_cohort_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  CONSTRAINT fieldpress_cohort_requests_no_self CHECK (requester_id != recipient_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fieldpress_cohort_requests_pending_pair
  ON fieldpress_cohort_requests (requester_id, recipient_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_fieldpress_cohort_requests_recipient
  ON fieldpress_cohort_requests (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_fieldpress_cohort_requests_requester
  ON fieldpress_cohort_requests (requester_id, status);
