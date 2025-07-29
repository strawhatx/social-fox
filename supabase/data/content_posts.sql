-- Create content_posts table for generated content
CREATE TABLE public.content_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'archived')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  engagement JSONB DEFAULT '{"likes": 0, "shares": 0, "comments": 0}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for content_posts
CREATE POLICY "Users can view content posts for their projects" 
ON public.content_posts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = content_posts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create content posts for their projects" 
ON public.content_posts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = content_posts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update content posts for their projects" 
ON public.content_posts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = content_posts.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete content posts for their projects" 
ON public.content_posts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = content_posts.project_id 
  AND projects.user_id = auth.uid()
));

-- Create platform_configs table
CREATE TABLE public.platform_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  platform TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  character_limit INTEGER,
  template TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, platform)
);

-- Enable RLS
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_configs
CREATE POLICY "Users can view platform configs for their projects" 
ON public.platform_configs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = platform_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create platform configs for their projects" 
ON public.platform_configs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = platform_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update platform configs for their projects" 
ON public.platform_configs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = platform_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete platform configs for their projects" 
ON public.platform_configs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = platform_configs.project_id 
  AND projects.user_id = auth.uid()
));

-- Create export_configs table
CREATE TABLE public.export_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);

-- Enable RLS
ALTER TABLE public.export_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for export_configs
CREATE POLICY "Users can view export configs for their projects" 
ON public.export_configs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = export_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create export configs for their projects" 
ON public.export_configs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = export_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update export configs for their projects" 
ON public.export_configs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = export_configs.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete export configs for their projects" 
ON public.export_configs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = export_configs.project_id 
  AND projects.user_id = auth.uid()
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_content_posts_updated_at
  BEFORE UPDATE ON public.content_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_configs_updated_at
  BEFORE UPDATE ON public.platform_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_export_configs_updated_at
  BEFORE UPDATE ON public.export_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
