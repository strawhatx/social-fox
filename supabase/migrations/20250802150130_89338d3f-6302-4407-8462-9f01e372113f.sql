-- Set automation_enabled to true by default for new projects
ALTER TABLE public.projects 
ALTER COLUMN automation_enabled SET DEFAULT true;