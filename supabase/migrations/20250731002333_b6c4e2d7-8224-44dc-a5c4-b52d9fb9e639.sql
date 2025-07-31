-- Add provider column to integrations table
ALTER TABLE public.integrations 
ADD COLUMN provider TEXT;

-- Add integration_id foreign key to agent_configs table
ALTER TABLE public.agent_configs 
ADD COLUMN integration_id UUID REFERENCES public.integrations(id);

-- Update existing integrations with correct provider values
UPDATE public.integrations 
SET provider = 'google_sheets' 
WHERE name = 'Google Sheets';

UPDATE public.integrations 
SET provider = 'gmail' 
WHERE name = 'Gmail';

-- Update Google Sheets integration to include userinfo scopes
UPDATE integrations 
SET config_data = config_data || '{"scopes": ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]}'
WHERE name = 'Google Sheets' AND is_active = true;

-- Update Gmail integration to include userinfo scopes
UPDATE integrations 
SET config_data = config_data || '{"scopes": ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]}'
WHERE name = 'Gmail' AND is_active = true;