DROP TABLE IF EXISTS content_posts;

-- Root-level entity: a scheduled or posted thread
CREATE TABLE content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,             -- 'twitter', 'linkedin', etc.
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'posted'
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Child-level entity: individual post or reply in the thread
CREATE TABLE content_post_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES content_post_items(id) ON DELETE SET NULL, -- reply threading
  content TEXT NOT NULL,
  media JSONB NOT NULL DEFAULT '[]',   -- images, videos, etc.
  metadata JSONB NOT NULL DEFAULT '{}', -- could store tweet_id, engagement, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
