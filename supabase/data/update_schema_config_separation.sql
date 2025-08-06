-- Update integrations table schema
-- First add new columns
ALTER TABLE public.integrations 
  ADD COLUMN IF NOT EXISTS config_public JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secrets JSONB;

-- Update connections table schema  
-- First add new columns
ALTER TABLE public.connections
  ADD COLUMN IF NOT EXISTS config_public JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS secrets JSONB;

-- Migrate existing integrations data
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

-- Migrate existing connections data
-- Move sensitive data (access_token, refresh_token, expires_at) to secrets
UPDATE public.connections
SET 
  config_public = account_config - 'access_token' - 'refresh_token' - 'expires_at',
  secrets = jsonb_build_object(
    'access_token', account_config->>'access_token',
    'refresh_token', account_config->>'refresh_token',
    'expires_at', account_config->>'expires_at'
  )
WHERE account_config IS NOT NULL;

-- Now safely drop the old columns after data migration
ALTER TABLE public.integrations DROP COLUMN IF EXISTS config;
ALTER TABLE public.connections DROP COLUMN IF EXISTS account_config;