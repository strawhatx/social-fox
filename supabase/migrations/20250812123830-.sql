-- Fix the security vulnerability in integrations_flat view
-- The issue is that client_secret should not be exposed in config_public
-- Let's create a safe version of the integrations_flat view that excludes client_secret

-- Drop the existing view
DROP VIEW IF EXISTS public.integrations_flat;

-- Create a secure version that excludes sensitive information
CREATE OR REPLACE VIEW public.integrations_flat AS
SELECT 
    id,
    name,
    provider,
    type,
    description,
    icon,
    is_active,
    created_at,
    updated_at,
    (config_public ->> 'client_id'::text) AS client_id,
    -- Explicitly exclude client_secret - it should be in secrets, not config_public
    (config_public ->> 'auth_url'::text) AS auth_url,
    (config_public ->> 'token_url'::text) AS token_url,
    (config_public ->> 'redirect_url'::text) AS redirect_url,
    COALESCE(((config_public ->> 'code_challenge_required'::text))::boolean, false) AS code_challenge_required,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'scopes'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'scopes'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS scopes,
    COALESCE(
        CASE
            WHEN (jsonb_typeof((config_public -> 'required_parameters'::text)) = 'array'::text) THEN (
                SELECT array_agg(jsonb_array_elements_text.value) AS array_agg
                FROM jsonb_array_elements_text((i.config_public -> 'required_parameters'::text)) jsonb_array_elements_text(value)
            )
            ELSE ARRAY[]::text[]
        END, ARRAY[]::text[]
    ) AS required_parameters
FROM integrations i;