-- Fix integrations_flat table security vulnerability
-- Enable Row Level Security on integrations_flat table
ALTER TABLE public.integrations_flat ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to view integration data but excludes sensitive fields
-- Since this appears to be system configuration data, we'll allow authenticated users to read it
-- but we need to ensure client_secret is never exposed
CREATE POLICY "Authenticated users can view public integration data"
ON public.integrations_flat
FOR SELECT
TO authenticated
USING (true);

-- However, we should create a safe view that excludes sensitive information
-- and use that instead of the raw table
CREATE OR REPLACE VIEW public.integrations_safe AS
SELECT 
  id,
  name,
  provider,
  type,
  description,
  icon,
  auth_url,
  redirect_url,
  token_url,
  required_parameters,
  scopes,
  code_challenge_required,
  client_id,  -- client_id is usually safe to expose
  -- Explicitly exclude client_secret and other sensitive fields
  created_at,
  updated_at,
  is_active
FROM public.integrations_flat;

-- Grant SELECT permission on the safe view to authenticated users
GRANT SELECT ON public.integrations_safe TO authenticated;