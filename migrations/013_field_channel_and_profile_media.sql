-- Neon PostgreSQL: Profile Cover Photos & Field Channel Casual Posts

-- Profile Customization Fields
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reporter_profiles') THEN
    ALTER TABLE reporter_profiles 
      ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS rank_tier VARCHAR(64) DEFAULT 'Field Scout';
  END IF;
END $$;

-- Field Channel (Casual / Off-Duty / Personal Logs)
CREATE TABLE IF NOT EXISTS field_channel_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_handle VARCHAR(64) NOT NULL,
    author_display_name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    category VARCHAR(32) NOT NULL DEFAULT 'casual', -- 'offduty', 'gear', 'soundtrack', 'bts'
    reactions JSONB NOT NULL DEFAULT '{"vibe": 0, "cheers": 0, "fire": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_channel_author 
    ON field_channel_posts (author_handle, created_at DESC);
