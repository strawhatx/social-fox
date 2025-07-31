-- Clean up invalid agent_type values
-- Remove records with 'oauth' agent_type as these seem to be old OAuth records
DELETE FROM public.agent_configs WHERE agent_type = 'oauth';

-- Remove any other invalid agent_type values
DELETE FROM public.agent_configs 
WHERE agent_type NOT IN ('channel_manager', 'lead_generator', 'content_creator', 'analytics_tracker');

-- Now add the constraints
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_project_id_agent_type_config_type_key;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_project_agent_unique 
  UNIQUE (project_id, agent_type);

-- Add check constraint to limit agent_type to valid values
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_agent_type_check;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_agent_type_check 
  CHECK (agent_type IN ('channel_manager', 'lead_generator', 'content_creator', 'analytics_tracker'));