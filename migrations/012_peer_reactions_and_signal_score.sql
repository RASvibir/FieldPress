-- Neon PostgreSQL: Peer Reactions, Reputation, and Badges

CREATE TABLE IF NOT EXISTS pressie_reactions (
    story_id VARCHAR(64) NOT NULL,
    user_handle VARCHAR(64) NOT NULL,
    reaction_type VARCHAR(16) NOT NULL, -- 'signal', 'heat', 'iconic'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (story_id, user_handle, reaction_type)
);

CREATE TABLE IF NOT EXISTS reporter_reputation (
    user_handle VARCHAR(64) PRIMARY KEY,
    signal_score INT NOT NULL DEFAULT 0,
    total_signals INT NOT NULL DEFAULT 0,
    total_heat INT NOT NULL DEFAULT 0,
    total_iconic INT NOT NULL DEFAULT 0,
    forks_earned INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earned_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_handle VARCHAR(64) NOT NULL,
    badge_id VARCHAR(32) NOT NULL, -- 'frontline_scout', 'proof_of_scene', 'fact_anchor', 'bureau_pillar'
    awarded_story_id VARCHAR(64),
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_handle, badge_id, awarded_story_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_story ON pressie_reactions (story_id);
CREATE INDEX IF NOT EXISTS idx_earned_badges_user ON earned_badges (user_handle);
