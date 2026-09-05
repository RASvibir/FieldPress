-- FieldPress schema baseline: moved out of Worker request path.
-- Apply once through the approved Neon migration workflow.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS age_band text NOT NULL DEFAULT 'teen';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS content_rating text NOT NULL DEFAULT 'pg13';

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS embargo_until timestamptz;

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS desk_checks jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS lane text NOT NULL DEFAULT 'wall';

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS pulse text NOT NULL DEFAULT 'spark';

CREATE TABLE IF NOT EXISTS pressie_stamps (
  story_id text NOT NULL,
  user_id text NOT NULL,
  ink text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, user_id)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS desk_tips (
  id text PRIMARY KEY,
  story_id text,
  body text NOT NULL,
  from_name varchar(200) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS desk_notes (
  id text PRIMARY KEY,
  story_id text NOT NULL,
  body text NOT NULL,
  from_name varchar(200) NOT NULL DEFAULT 'Desk',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS image_generation_log (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  story_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
