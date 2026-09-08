-- Neon PostgreSQL: Community Verification Notes
CREATE TABLE IF NOT EXISTS story_verification_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id VARCHAR(64) NOT NULL,
    author_handle VARCHAR(64) NOT NULL,
    note_type VARCHAR(32) NOT NULL, -- 'confirmed', 'context', 'contradiction'
    content TEXT NOT NULL,
    citation_source TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'proposed', -- 'anchored', 'proposed', 'rejected'
    helpful_votes INT NOT NULL DEFAULT 0,
    unhelpful_votes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_notes_story 
    ON story_verification_notes (story_id, created_at DESC);

CREATE TABLE IF NOT EXISTS verification_note_ratings (
    note_id UUID REFERENCES story_verification_notes(id) ON DELETE CASCADE,
    rater_handle VARCHAR(64) NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    reason VARCHAR(64), -- 'cites_records', 'clear_evidence', 'speculative'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (note_id, rater_handle)
);
