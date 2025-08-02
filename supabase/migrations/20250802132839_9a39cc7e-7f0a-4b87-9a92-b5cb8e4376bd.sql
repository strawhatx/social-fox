-- Clean up unused tables from the database
-- These tables were used for the content generation workflow that was removed

-- Drop unused tables
DROP TABLE IF EXISTS public.content_sources CASCADE;
DROP TABLE IF EXISTS public.export_configs CASCADE; 
DROP TABLE IF EXISTS public.platform_configs CASCADE;
DROP TABLE IF EXISTS public.cache CASCADE;