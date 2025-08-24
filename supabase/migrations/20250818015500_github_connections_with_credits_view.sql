-- Create view to filter GitHub connections for users with sufficient credits
-- GitHub data fetching can consume variable tokens based on repository size/activity
-- This view ensures users have minimum credits before processing GitHub connections

create or replace view public.github_connections_with_credits as
with project_usage as (
    select
        c.id as connection_id,
        c.project_id,
        c.integration_id,
        c.config_public,
        c.account_identifier,
        c.is_active,
        c.status,
        c.created_at,
        c.updated_at,
        p.user_id,
        p.name as project_name,
        p.last_fetched_at,
        i.name as integration_name,
        i.provider,
        uc.credits as user_credits,
        uc.id as user_credits_id,
        coalesce(
            (c.config_public ->> 'estimated_token_usage')::integer,
            3
        ) as estimated_token_usage
    from connections c
    join projects p on c.project_id = p.id
    join integrations i on c.integration_id = i.id
    join user_credits uc on p.user_id = uc.user_id
    where
        i.provider = 'github'
        and i.type = 'data_source'
        and c.is_active = true
        and c.status = 'connected'::connection_status
        and (c.config_public -> 'repository') ->> 'owner' is not null
        and (c.config_public -> 'repository') ->> 'repository' is not null
),
running_total as (
    select *,
        sum(estimated_token_usage) over (
            partition by user_id 
            order by created_at, connection_id
            rows between unbounded preceding and current row
        ) as cumulative_usage
    from project_usage
)
select *
from running_total
where cumulative_usage <= user_credits;

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