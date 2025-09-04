-- twitter profile and recent posts cache
CREATE TABLE IF NOT EXISTS twitter_profile_cache (
  id uuid primary key default gen_random_uuid(),
  user_id TEXT NOT NULL, -- our app user id (clerk)
  twitter_user_id TEXT, -- X user id
  handle TEXT, -- @handle
  name TEXT,
  description TEXT,
  profile_image_url TEXT,
  followers_count INTEGER,
  following_count INTEGER,
  tweet_count INTEGER,
  raw_json JSONB,
  last_posts JSONB,
  
  -- Metadata for sync
    last_profile_fetch_at TIMESTAMPTZ,
    last_posts_fetch_at TIMESTAMPTZ,

    -- Activity scoring for scheduling
    last_post_seen_at TIMESTAMPTZ,
    activity_score INT DEFAULT 0,

    -- Control flags
    refresh_status VARCHAR(20) DEFAULT 'idle', -- idle | queued | fetching | error
    error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_user_id ON twitter_profile_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_last_profile_fetch_at ON twitter_profile_cache(last_profile_fetch_at);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_last_posts_fetch_at ON twitter_profile_cache(last_posts_fetch_at);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_last_post_seen_at ON twitter_profile_cache(last_post_seen_at);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_activity_score ON twitter_profile_cache(activity_score);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_refresh_status ON twitter_profile_cache(refresh_status);
CREATE INDEX IF NOT EXISTS idx_twitter_profile_cache_error_message ON twitter_profile_cache(error_message);


