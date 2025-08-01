-- Create connections table for project-to-integration relationships
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  integration_id UUID NOT NULL,
  account_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, integration_id, account_config->>'account_identifier')
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view connections for their projects" 
ON public.connections 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = connections.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create connections for their projects" 
ON public.connections 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = connections.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update connections for their projects" 
ON public.connections 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = connections.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete connections for their projects" 
ON public.connections 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = connections.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();