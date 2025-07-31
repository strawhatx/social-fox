-- Add provider column to integrations table
ALTER TABLE public.integrations 
ADD COLUMN provider TEXT NOT NULL DEFAULT '';

-- Modify is_active column to be nullable (it's currently NOT NULL)
ALTER TABLE public.integrations 
ALTER COLUMN is_active DROP NOT NULL;

-- Add integration_id column to agent_configs table
ALTER TABLE public.agent_configs 
ADD COLUMN integration_id UUID;

-- Add foreign key constraint
ALTER TABLE public.agent_configs 
ADD CONSTRAINT fk_agent_configs_integration 
FOREIGN KEY (integration_id) REFERENCES public.integrations(id) ON DELETE CASCADE;

-- Update existing integrations with provider values
UPDATE public.integrations SET provider = 'google' WHERE name IN ('Google Sheets', 'Gmail');

-- Remove the default value from provider column now that existing data is updated
ALTER TABLE public.integrations ALTER COLUMN provider DROP DEFAULT;