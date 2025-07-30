-- Update redirect URLs for Google integrations to point to the edge function
UPDATE integrations 
SET config_data = jsonb_set(
  config_data, 
  '{redirect_url}', 
  '"https://nmdmgdbbiivqazqjejdc.supabase.co/functions/v1/google-oauth/callback"'
)
WHERE name IN ('Gmail', 'Google Sheets');