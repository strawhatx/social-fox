-- Unified application jobs queue
CREATE TABLE IF NOT EXISTS public.app_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  action TEXT NOT NULL CHECK (action IN ('profile','posts','templates')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','error')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_jobs_status_created ON public.app_jobs(status, created_at);


