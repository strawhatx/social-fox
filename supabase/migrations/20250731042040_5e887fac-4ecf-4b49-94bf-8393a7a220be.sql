-- Fix the redirect URLs to point to the correct oauth-callback function
UPDATE public.integrations 
SET config_data = jsonb_set(
  config_data, 
  '{redirect_url}', 
  '"https://nmdmgdbbiivqazqjejdc.supabase.co/functions/v1/oauth-callback"'::jsonb
)
WHERE name IN ('Google Sheets', 'Gmail');