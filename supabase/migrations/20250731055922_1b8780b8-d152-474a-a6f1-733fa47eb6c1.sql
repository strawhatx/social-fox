-- First, let's merge the duplicate lead_generator configs into one
WITH merged_configs AS (
  SELECT 
    project_id,
    agent_type,
    jsonb_object_agg(config_type, config_data) as merged_config_data,
    MAX(created_at) as latest_created_at,
    MAX(updated_at) as latest_updated_at
  FROM public.agent_configs 
  WHERE project_id = '54e79dab-eedf-43f2-9d54-cb26439863cb' 
    AND agent_type = 'lead_generator'
  GROUP BY project_id, agent_type
)
INSERT INTO public.agent_configs (project_id, agent_type, config_type, config_data, created_at, updated_at)
SELECT 
  project_id,
  agent_type,
  'main' as config_type,
  merged_config_data,
  latest_created_at,
  latest_updated_at
FROM merged_configs;

-- Delete the old duplicate records
DELETE FROM public.agent_configs 
WHERE project_id = '54e79dab-eedf-43f2-9d54-cb26439863cb' 
  AND agent_type = 'lead_generator'
  AND config_type IN ('oauth_sheets', 'user_settings');

-- Remove any remaining oauth type records
DELETE FROM public.agent_configs WHERE agent_type = 'oauth';

-- Now add the unique constraint
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_project_agent_unique 
  UNIQUE (project_id, agent_type);

-- Add check constraint to limit agent_type to valid values
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_agent_type_check 
  CHECK (agent_type IN ('channel_manager', 'lead_generator', 'content_creator', 'analytics_tracker'));