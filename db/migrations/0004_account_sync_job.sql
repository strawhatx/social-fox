-- X account sync jobs
CREATE TABLE public.twitter_account_sync_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('profile', 'posts')),
    status TEXT NOT NULL DEFAULT 'pending',
    progress INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);