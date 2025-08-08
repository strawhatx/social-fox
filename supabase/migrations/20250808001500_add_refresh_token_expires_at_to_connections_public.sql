-- Add refresh_token_expires_at to connections_public view
-- Preserve access_expires_at (with legacy fallback) and status columns

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
  status,
  (config_public->>'refresh_token_expires_at')::bigint AS refresh_token_expires_at
FROM public.connections;

ALTER VIEW public.connections_public SET (security_barrier = true); 