-- Add unique constraint to prevent multiple configs for same project-agent combination
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_project_id_agent_type_config_type_key;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_project_agent_unique 
  UNIQUE (project_id, agent_type);

-- Add check constraint to limit agent_type to valid values
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_agent_type_check;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_agent_type_check 
  CHECK (agent_type IN ('channel_manager', 'lead_generator', 'content_creator', 'analytics_tracker'));

-- Update existing records to use 'main' as config_type if not already set
UPDATE public.agent_configs 
SET config_type = 'main' 
WHERE config_type IS NULL OR config_type = '';

-- Since we now have a unique constraint on project_id + agent_type, 
-- we can remove config_type from the unique constraint and just use it as a standard field
-- Remove any duplicate records that might exist (keeping the most recent)
DELETE FROM public.agent_configs a USING public.agent_configs b 
WHERE a.id < b.id 
  AND a.project_id = b.project_id 
  AND a.agent_type = b.agent_type;