-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] DEFAULT '{}',
  content_sources INTEGER DEFAULT 0,
  last_generated TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'paused', 'draft')) DEFAULT 'draft',
  brand_voice TEXT,
  target_audience TEXT,
  -- Role permissions
  role_brand_builder BOOLEAN DEFAULT false,
  role_content_creator BOOLEAN DEFAULT false,
  role_audience_researcher BOOLEAN DEFAULT false,
  role_campaign_planner BOOLEAN DEFAULT false,
  role_channel_manager BOOLEAN DEFAULT false,
  role_analytics_tracker BOOLEAN DEFAULT false,
  role_lead_generator BOOLEAN DEFAULT false,
  role_community_engager BOOLEAN DEFAULT false,
  role_growth_hacker BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create content_sources table for tracking content sources
CREATE TABLE public.content_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'rss', 'social', 'blog', etc.
  url TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for content_sources
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for content_sources (users can only access sources for their projects)
CREATE POLICY "Users can view content sources for their projects" 
ON public.content_sources 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = content_sources.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can create content sources for their projects" 
ON public.content_sources 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = content_sources.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can update content sources for their projects" 
ON public.content_sources 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = content_sources.project_id 
  AND projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete content sources for their projects" 
ON public.content_sources 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.projects 
  WHERE projects.id = content_sources.project_id 
  AND projects.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates on projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on content_sources
CREATE TRIGGER update_content_sources_updated_at
  BEFORE UPDATE ON public.content_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for projects table
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Enable realtime for content_sources table  
ALTER TABLE public.content_sources REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_sources;
