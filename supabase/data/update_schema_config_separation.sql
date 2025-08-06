-- Update integrations table schema
-- Remove the old config column and add new separated columns
ALTER TABLE public.integrations 
  DROP COLUMN IF EXISTS config,
  ADD COLUMN IF NOT EXISTS config_public JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secrets JSONB;

-- Update connections table schema  
-- Remove the old account_config column and add new separated columns
ALTER TABLE public.connections
  DROP COLUMN IF EXISTS account_config,
  ADD COLUMN IF NOT EXISTS config_public JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secrets JSONB;

-- Update existing integrations data to move sensitive info to secrets
-- Move client_secret and other sensitive data from config_data to secrets
UPDATE public.integrations 
SET 
  config_public = config_data - 'client_secret',
  secrets = jsonb_build_object('client_secret', config_data->>'client_secret')
WHERE config_data ? 'client_secret';

-- For integrations without client_secret, just move all config_data to config_public
UPDATE public.integrations 
SET config_public = config_data
WHERE NOT config_data ? 'client_secret' AND config_public = '{}';