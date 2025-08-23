-- Add status column to projects table
ALTER TABLE public.projects 
ADD COLUMN status text NOT NULL DEFAULT 'draft';

-- Add check constraint for valid status values
ALTER TABLE public.projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('draft', 'initialized'));