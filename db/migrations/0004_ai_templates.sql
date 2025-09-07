-- Tweets storage for Social Fox
CREATE TABLE IF NOT EXISTS public.ai_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful index for querying latest tweets
CREATE INDEX IF NOT EXISTS idx_tweets_user_created_at ON public.tweets (user_id, created_at DESC);


