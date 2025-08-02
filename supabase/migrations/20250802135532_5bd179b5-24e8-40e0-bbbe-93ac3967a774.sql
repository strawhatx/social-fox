-- Remove status column from projects table as it's not being used
ALTER TABLE public.projects DROP COLUMN IF EXISTS status;