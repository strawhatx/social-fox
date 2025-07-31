-- Fix redirect URLs for all OAuth integrations to point to React app callback
UPDATE public.integrations 
SET config_data = jsonb_set(
  config_data, 
  '{redirect_url}', 
  '"https://nmdmgdbbiivqazqjejdc.supabase.co/oauth/callback"'
)
WHERE type = 'oauth' 
AND config_data->>'redirect_url' = 'https://nmdmgdbbiivqazqjejdc.supabase.co/functions/v1/oauth-callback';