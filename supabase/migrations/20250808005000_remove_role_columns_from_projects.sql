-- Remove role-related columns from public.projects
-- Safe to run multiple times with IF EXISTS guards

ALTER TABLE public.projects
  DROP COLUMN IF EXISTS role_brand_builder,
  DROP COLUMN IF EXISTS role_content_creator,
  DROP COLUMN IF EXISTS role_audience_researcher,
  DROP COLUMN IF EXISTS role_campaign_planner,
  DROP COLUMN IF EXISTS role_channel_manager,
  DROP COLUMN IF EXISTS role_analytics_tracker,
  DROP COLUMN IF EXISTS role_lead_generator,
  DROP COLUMN IF EXISTS role_community_engager,
  DROP COLUMN IF EXISTS role_growth_hacker;


