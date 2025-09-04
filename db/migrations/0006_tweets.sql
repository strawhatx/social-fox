-- Tweets storage for Social Fox
CREATE TABLE IF NOT EXISTS public.tweets (
  tweet_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful index for querying latest tweets
CREATE INDEX IF NOT EXISTS idx_tweets_user_created_at ON public.tweets (user_id, created_at DESC);


