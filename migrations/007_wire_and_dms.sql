-- Neon PostgreSQL: Fieldy Wire & Messenger DMs
CREATE TABLE IF NOT EXISTS bureau_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bureau_id VARCHAR(64) DEFAULT 'global',
    sender_handle VARCHAR(64) NOT NULL,
    sender_display_name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    content TEXT NOT NULL,
    message_type VARCHAR(32) NOT NULL DEFAULT 'chat',
    is_promoted_to_desk BOOLEAN NOT NULL DEFAULT FALSE,
    promoted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bureau_messages_bureau_created 
    ON bureau_messages (bureau_id, created_at DESC);

CREATE TABLE IF NOT EXISTS dm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dm_participants (
    conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE,
    user_handle VARCHAR(64) NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_handle)
);

CREATE TABLE IF NOT EXISTS dm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES dm_conversations(id) ON DELETE CASCADE,
    sender_handle VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_promoted_to_desk BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation 
    ON dm_messages (conversation_id, created_at ASC);
