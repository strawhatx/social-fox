-- Create view to filter scheduled content posts for users with sufficient credits
-- This view only returns scheduled content posts where the user has enough credits 
-- to cover ALL their scheduled posts (not just > 0)

CREATE OR REPLACE VIEW public.scheduled_content_posts_with_credits AS
SELECT 
  cp.id,
  cp.project_id,
  cp.content,
  cp.platform,
  cp.status,
  cp.scheduled_at,
  cp.posted_at,
  cp.engagement,
  cp.metadata,
  cp.created_at,
  cp.updated_at,
  -- Include project and user information for context
  p.user_id,
  p.name as project_name,
  -- Include credit information
  uc.credits,
  uc.id as user_credits_id,
  -- Include count information for transparency
  user_scheduled_counts.total_scheduled_posts,
  user_scheduled_counts.credits_needed
FROM public.content_posts cp
INNER JOIN public.projects p ON cp.project_id = p.id
INNER JOIN public.user_credits uc ON p.user_id = uc.user_id
INNER JOIN (
  -- Subquery to calculate total scheduled posts per user
  SELECT 
    p2.user_id,
    COUNT(*) as total_scheduled_posts,
    COUNT(*) as credits_needed  -- 1 credit per post
  FROM public.content_posts cp2
  INNER JOIN public.projects p2 ON cp2.project_id = p2.id
  WHERE 
    cp2.status = 'scheduled'
    AND cp2.scheduled_at <= CURRENT_DATE
  GROUP BY p2.user_id
) user_scheduled_counts ON p.user_id = user_scheduled_counts.user_id
WHERE 
  -- Only include scheduled posts
  cp.status = 'scheduled'
  -- Only include users who have enough credits for ALL their scheduled posts
  AND uc.credits >= user_scheduled_counts.credits_needed
  -- Only include posts that are due to be posted (today or overdue)
  AND cp.scheduled_at <= CURRENT_DATE;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.scheduled_content_posts_with_credits IS 
'View that returns scheduled content posts only for users who have enough credits to cover ALL their scheduled posts. Includes posts due today or overdue. Includes credit count information for transparency.';

-- Create index on the underlying tables to optimize this view's performance
-- (These may already exist, but this ensures good performance)
CREATE INDEX IF NOT EXISTS idx_content_posts_status_scheduled_at 
ON public.content_posts(status, scheduled_at) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_projects_user_id 
ON public.projects(user_id);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id_credits 
ON public.user_credits(user_id, credits);

-- Enable RLS on the view (inherits from underlying tables)
-- The view will respect the existing RLS policies on content_posts, projects, and user_credits

-- Example usage queries:
-- 
-- 1. Get all scheduled posts for users with sufficient credits:
-- SELECT * FROM public.scheduled_content_posts_with_credits;
-- 
-- 2. Get scheduled posts for a specific user (if they have enough credits):
-- SELECT * FROM public.scheduled_content_posts_with_credits WHERE user_id = 'user-uuid';
-- 
-- 3. Get scheduled posts due today for users with sufficient credits:
-- SELECT * FROM public.scheduled_content_posts_with_credits WHERE scheduled_at = CURRENT_DATE;
-- 
-- 4. See credit status per user (includes credit counts):
-- SELECT DISTINCT user_id, credits, total_scheduled_posts, credits_needed,
--        (credits - credits_needed) as credits_remaining
-- FROM public.scheduled_content_posts_with_credits;
-- 
-- 5. Users who can afford all their scheduled posts:
-- SELECT DISTINCT user_id, credits, total_scheduled_posts
-- FROM public.scheduled_content_posts_with_credits
-- WHERE credits >= total_scheduled_posts;