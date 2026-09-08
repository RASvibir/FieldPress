-- Neon PostgreSQL: Pressie Ownership, Fork Policy & Share Attribution

-- Support both 'pressies' and 'stories' table naming
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pressies') THEN
    ALTER TABLE pressies 
      ADD COLUMN IF NOT EXISTS original_creator_handle VARCHAR(64),
      ADD COLUMN IF NOT EXISTS fork_policy VARCHAR(32) NOT NULL DEFAULT 'open', -- 'open', 'collab_only', 'locked'
      ADD COLUMN IF NOT EXISTS allow_collab BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS shared_by_handle VARCHAR(64),
      ADD COLUMN IF NOT EXISTS share_count INT NOT NULL DEFAULT 0;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stories') THEN
    ALTER TABLE stories 
      ADD COLUMN IF NOT EXISTS original_creator_handle VARCHAR(64),
      ADD COLUMN IF NOT EXISTS fork_policy VARCHAR(32) NOT NULL DEFAULT 'open',
      ADD COLUMN IF NOT EXISTS allow_collab BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS shared_by_handle VARCHAR(64),
      ADD COLUMN IF NOT EXISTS share_count INT NOT NULL DEFAULT 0;
  END IF;
END $$;
