-- Fix redirect URLs for all OAuth integrations to point to React app callback
UPDATE public.integrations 
SET config_data = jsonb_set(
  config_data, 
  '{redirect_url}', 
  '"https://dd958eb1-3890-4e73-83b6-074d7e649f8c.lovableproject.com/oauth/callback"'
)
WHERE type = 'oauth' 
AND config_data->>'redirect_url' = 'https://nmdmgdbbiivqazqjejdc.supabase.co/functions/v1/oauth-callback';