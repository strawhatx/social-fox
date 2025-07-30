-- Create agent_configs table for storing agent-specific configurations
CREATE TABLE public.agent_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  config_type TEXT NOT NULL, -- 'oauth', 'user_settings', etc.
  config_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, agent_type, config_type)
);

-- Enable RLS
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view agent configs for their projects" 
ON public.agent_configs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = agent_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create agent configs for their projects" 
ON public.agent_configs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = agent_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update agent configs for their projects" 
ON public.agent_configs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = agent_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete agent configs for their projects" 
ON public.agent_configs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = agent_configs.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_agent_configs_updated_at
BEFORE UPDATE ON public.agent_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();