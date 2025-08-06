-- Enable RLS on integrations table but remove existing policies
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on integrations table
DROP POLICY IF EXISTS "Authenticated users can view integrations" ON public.integrations;
DROP POLICY IF EXISTS "Service role can manage integrations" ON public.integrations;

-- Create a view for integrations that excludes secrets column
CREATE OR REPLACE VIEW public.integrations_public AS
SELECT 
  id,
  name,
  provider,
  type,
  description,
  icon,
  config_data,
  config_public,
  is_active,
  created_at,
  updated_at
FROM public.integrations;

-- Enable RLS on the integrations view
ALTER VIEW public.integrations_public SET (security_barrier = true);

-- Create policy on integrations view - authenticated users can view
CREATE POLICY "Authenticated users can view integrations" 
ON public.integrations_public 
FOR SELECT 
TO authenticated 
USING (true);

-- Update connections table policies
-- Keep existing create, update, delete policies but remove view policy
DROP POLICY IF EXISTS "Users can view connections for their projects" ON public.connections;

-- Create a view for connections that excludes secrets column
CREATE OR REPLACE VIEW public.connections_public AS
SELECT 
  id,
  project_id,
  integration_id,
  config_public,
  account_identifier,
  is_active,
  created_at,
  updated_at
FROM public.connections;

-- Enable RLS on the connections view
ALTER VIEW public.connections_public SET (security_barrier = true);

-- Create policy on connections view - users can view connections for their projects
CREATE POLICY "Users can view connections for their projects" 
ON public.connections_public 
FOR SELECT 
TO authenticated 
USING (EXISTS ( 
  SELECT 1
  FROM projects
  WHERE ((projects.id = connections_public.project_id) AND (projects.user_id = auth.uid()))
));