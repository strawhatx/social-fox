-- First, let's see what duplicates exist
SELECT project_id, agent_type, COUNT(*) as count, 
       array_agg(id ORDER BY created_at DESC) as ids
FROM public.agent_configs 
GROUP BY project_id, agent_type 
HAVING COUNT(*) > 1;

-- Delete duplicate records, keeping only the most recent one for each project-agent combination
DELETE FROM public.agent_configs 
WHERE id NOT IN (
  SELECT DISTINCT ON (project_id, agent_type) id
  FROM public.agent_configs 
  ORDER BY project_id, agent_type, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_project_id_agent_type_config_type_key;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_project_agent_unique 
  UNIQUE (project_id, agent_type);

-- Add check constraint to limit agent_type to valid values
ALTER TABLE public.agent_configs DROP CONSTRAINT IF EXISTS agent_configs_agent_type_check;
ALTER TABLE public.agent_configs ADD CONSTRAINT agent_configs_agent_type_check 
  CHECK (agent_type IN ('channel_manager', 'lead_generator', 'content_creator', 'analytics_tracker'));