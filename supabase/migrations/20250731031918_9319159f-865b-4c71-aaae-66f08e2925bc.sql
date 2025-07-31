-- Fix security issue: Remove SECURITY DEFINER and add proper RLS
DROP VIEW IF EXISTS public.integrations_flat;

-- Create a regular view (without SECURITY DEFINER)
CREATE VIEW public.integrations_flat AS
SELECT 
  i.id,
  i.name,
  i.provider,
  i.type,
  i.description,
  i.icon,
  i.is_active,
  i.created_at,
  i.updated_at,
  -- Extract OAuth configuration from nested config_data
  (i.config_data->>'client_id') as client_id,
  (i.config_data->>'client_secret') as client_secret,
  (i.config_data->>'auth_url') as auth_url,
  (i.config_data->>'token_url') as token_url,
  (i.config_data->>'redirect_url') as redirect_url,
  COALESCE((i.config_data->>'code_challenge_required')::boolean, false) as code_challenge_required,
  COALESCE(
    CASE 
      WHEN jsonb_typeof(i.config_data->'scopes') = 'array' 
      THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(i.config_data->'scopes'))
      ELSE ARRAY[]::text[]
    END,
    ARRAY[]::text[]
  ) as scopes,
  COALESCE(
    CASE 
      WHEN jsonb_typeof(i.config_data->'required_parameters') = 'array' 
      THEN (SELECT array_agg(value::text) FROM jsonb_array_elements_text(i.config_data->'required_parameters'))
      ELSE ARRAY[]::text[]
    END,
    ARRAY[]::text[]
  ) as required_parameters
FROM integrations i;

-- Enable RLS on the view
ALTER VIEW public.integrations_flat ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the view (inherits from integrations table policies)
CREATE POLICY "Authenticated users can view integrations_flat" 
ON public.integrations_flat 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Service role can manage integrations_flat" 
ON public.integrations_flat 
FOR ALL 
USING (auth.role() = 'service_role'::text);