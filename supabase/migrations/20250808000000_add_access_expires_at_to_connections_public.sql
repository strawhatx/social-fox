-- Add access_expires_at to connections_public view by projecting it from config_public
-- Uses either config_public.access_expires_at or config_public.access_token_expires_at (fallback)

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
   /* Pull as bigint epoch ms from config_public; prefer access_expires_at, fall back to access_token_expires_at */
  COALESCE(
    (config_public->>'access_expires_at')::bigint,
    (config_public->>'access_token_expires_at')::bigint
  ) AS access_expires_at
FROM public.connections;

-- Ensure security barrier remains set on the view
ALTER VIEW public.connections_public SET (security_barrier = true); 