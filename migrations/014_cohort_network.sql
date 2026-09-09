-- Neon PostgreSQL: Peer Cohort Network
CREATE TABLE IF NOT EXISTS user_cohorts (
    user_handle VARCHAR(64) NOT NULL,
    cohort_handle VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'connected', -- 'connected', 'pending', 'blocked'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_handle, cohort_handle)
);

CREATE INDEX IF NOT EXISTS idx_user_cohorts_user ON user_cohorts (user_handle);
CREATE INDEX IF NOT EXISTS idx_user_cohorts_cohort ON user_cohorts (cohort_handle);
