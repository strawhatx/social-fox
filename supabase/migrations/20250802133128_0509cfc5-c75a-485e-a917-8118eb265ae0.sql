-- Add automation toggle to projects table
ALTER TABLE public.projects 
ADD COLUMN automation_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN automation_frequency TEXT DEFAULT 'daily'; -- 'hourly', 'daily', 'weekly'