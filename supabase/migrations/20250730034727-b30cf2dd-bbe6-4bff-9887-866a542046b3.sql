-- Create integrations table for storing integration definitions/templates
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  config_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies - integrations are viewable by all authenticated users
CREATE POLICY "Authenticated users can view integrations" 
ON public.integrations 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only service role can modify integrations (for admin/system use)
CREATE POLICY "Service role can manage integrations" 
ON public.integrations 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Google Sheets integration definition
INSERT INTO public.integrations (name, type, icon, description, config_data) VALUES
('Google Sheets', 'oauth', 'google_sheets-icon', 'Connect and sync with your Google Sheets data', '{
  "scopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_url": "https://oauth2.googleapis.com/token",
  "redirect_url": "http://localhost:3000/google_sheets/callback",
  "required_parameters": [],
  "code_challenge_required": false
}'::jsonb);

-- Insert Gmail integration definition  
INSERT INTO public.integrations (name, type, icon, description, config_data) VALUES
('Gmail', 'oauth', 'gmail-icon', 'Connect to Gmail for lead management and communication', '{
  "scopes": [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
  ],
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_url": "https://oauth2.googleapis.com/token",
  "redirect_url": "http://localhost:3000/gmail/callback",
  "required_parameters": [],
  "code_challenge_required": false
}'::jsonb);