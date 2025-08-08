-- Add status to connections: connected | revoked | expired
-- Also expose status on connections_public and backfill expired based on config_public expiry

BEGIN;

-- Create enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'connection_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.connection_status AS ENUM ('connected', 'revoked', 'expired');
  END IF;
END$$;

-- Add column to connections table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'connections' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.connections
      ADD COLUMN status public.connection_status NOT NULL DEFAULT 'connected';
  END IF;
END$$;

-- Backfill: mark expired where access expiry in config_public is in the past
UPDATE public.connections c
SET status = 'expired'
WHERE (
  COALESCE(
    NULLIF(c.config_public->>'access_expires_at', '')::bigint,
    NULLIF(c.config_public->>'access_token_expires_at', '')::bigint
  )
) IS NOT NULL
AND COALESCE(
  NULLIF(c.config_public->>'access_expires_at', '')::bigint,
  NULLIF(c.config_public->>'access_token_expires_at', '')::bigint
) < (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
AND status <> 'revoked';

-- Optional: index for filtering by status
CREATE INDEX IF NOT EXISTS connections_status_idx ON public.connections (status);

-- Expose status and access_expires_at on the public view
CREATE OR REPLACE VIEW public.connections_public AS
SELECT 
  id,
  project_id,
  integration_id,
  account_identifier,
  config_public,
  is_active,
  created_at,
  updated_at,
  COALESCE(
    (config_public->>'access_expires_at')::bigint,
    (config_public->>'access_token_expires_at')::bigint
  ) AS access_expires_at,
  status
FROM public.connections;

ALTER VIEW public.connections_public SET (security_barrier = true);

COMMIT; 