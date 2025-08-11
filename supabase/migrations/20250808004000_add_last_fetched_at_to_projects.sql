-- Add last_fetched_at to projects table (nullable timestamp with time zone)
-- Safe to run multiple times

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'last_fetched_at'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN last_fetched_at timestamptz NULL;
  END IF;
END$$;

-- Optional: index to query by recency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'projects_last_fetched_at_idx' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX projects_last_fetched_at_idx ON public.projects (last_fetched_at DESC);
  END IF;
END$$;

COMMIT;


