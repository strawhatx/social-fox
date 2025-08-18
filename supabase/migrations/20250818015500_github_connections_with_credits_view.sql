-- Create view to filter GitHub connections for users with sufficient credits
-- GitHub data fetching can consume variable tokens based on repository size/activity
-- This view ensures users have minimum credits before processing GitHub connections

CREATE OR REPLACE VIEW public.github_connections_with_credits AS
SELECT 
  c.id as connection_id,
  c.project_id,
  c.integration_id,
  c.config_public,
  c.account_identifier,
  c.is_active,
  c.status,
  c.created_at,
  c.updated_at,
  -- Include project and user information
  p.user_id,
  p.name as project_name,
  p.last_fetched_at,
  -- Include integration information
  i.name as integration_name,
  i.provider,
  -- Include credit information
  uc.credits,
  uc.id as user_credits_id,
  -- Estimate token usage based on repository characteristics
  CASE 
    WHEN c.config_public ->> 'estimated_token_usage' IS NOT NULL 
    THEN (c.config_public ->> 'estimated_token_usage')::integer
    ELSE 3  -- Default minimum for GitHub data fetching
  END as estimated_token_usage
FROM public.connections c
INNER JOIN public.projects p ON c.project_id = p.id
INNER JOIN public.integrations i ON c.integration_id = i.id
INNER JOIN public.user_credits uc ON p.user_id = uc.user_id
WHERE 
  -- Only include GitHub connections
  i.provider = 'github'
  AND i.type = 'data_source'
  -- Only include active connections
  AND c.is_active = true
  AND c.status = 'connected'
  -- Only include users who have enough credits for GitHub data fetching
  AND uc.credits >= 3  -- Minimum 3 tokens for GitHub operations
  -- Only include connections that are properly configured
  AND c.config_public -> 'repository' ->> 'owner' IS NOT NULL
  AND c.config_public -> 'repository' ->> 'repository' IS NOT NULL;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.github_connections_with_credits IS 
'View that returns active GitHub connections only for users who have sufficient credits for GitHub data fetching. Includes estimated token usage and repository configuration. Minimum 3 tokens required by default, but can be customized per connection.';

-- Create indexes to optimize this view's performance
CREATE INDEX IF NOT EXISTS idx_connections_provider_active 
ON public.connections(integration_id, is_active, status)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_integrations_provider_type 
ON public.integrations(provider, type)
WHERE provider = 'github' AND type = 'data_source';

-- Enable RLS on the view (inherits from underlying tables)
-- The view will respect the existing RLS policies on connections, projects, and user_credits

-- Example usage queries:
-- 
-- 1. Get all GitHub connections for users with sufficient credits:
-- SELECT * FROM public.github_connections_with_credits;
-- 
-- 2. Get GitHub connections for a specific user:
-- SELECT * FROM public.github_connections_with_credits WHERE user_id = 'user-uuid';
-- 
-- 3. Get GitHub connections that need initialization:
-- SELECT * FROM public.github_connections_with_credits WHERE initialized_at IS NULL;
-- 
-- 4. Check credit status for GitHub users:
-- SELECT user_id, credits, estimated_token_usage, 
--        (credits - estimated_token_usage) as credits_remaining,
--        repo_owner, repo_name
-- FROM public.github_connections_with_credits;
-- 
-- 5. Get connections with custom token usage estimates:
-- SELECT * FROM public.github_connections_with_credits 
-- WHERE estimated_token_usage > 3;