-- Tweets-specific sync jobs (separate from profile jobs)
CREATE TABLE IF NOT EXISTS public.tweets_sync_job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tweets_sync_job_status_created
  ON public.tweets_sync_job (status, created_at);


