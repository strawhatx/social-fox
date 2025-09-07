-- user_quotas: per-user monthly usage tracking
CREATE TABLE IF NOT EXISTS public.user_quotas (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  monthly_limit INTEGER NOT NULL DEFAULT 5,
  used_count INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month')
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_quotas_reset_date ON public.user_quotas (reset_date);
