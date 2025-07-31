-- Create oauth_states table for OAuth state management
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_hash TEXT NOT NULL UNIQUE,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  pkce_verifier TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policies for oauth_states (public access for OAuth flow)
CREATE POLICY "Allow OAuth state operations" 
ON public.oauth_states 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create connectors table for OAuth provider configurations
CREATE TABLE public.connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;

-- Create policies for connectors (service role can manage, authenticated can read)
CREATE POLICY "Service role can manage connectors" 
ON public.connectors 
FOR ALL 
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Authenticated users can view connectors" 
ON public.connectors 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Create cache table for temporary data storage
CREATE TABLE public.cache (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cache ENABLE ROW LEVEL SECURITY;

-- Create policies for cache (public access for temporary storage)
CREATE POLICY "Allow cache operations" 
ON public.cache 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on connectors
CREATE TRIGGER update_connectors_updated_at
BEFORE UPDATE ON public.connectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Google Sheets connector configuration
INSERT INTO public.connectors (name, provider, config) VALUES 
('Google Sheets', 'google_sheets', '{
  "client_id": "",
  "client_secret": "",
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_url": "https://oauth2.googleapis.com/token",
  "code_challenge_required": true
}'::jsonb);

-- Insert other common OAuth providers
INSERT INTO public.connectors (name, provider, config) VALUES 
('Gmail', 'gmail', '{
  "client_id": "",
  "client_secret": "",
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_url": "https://oauth2.googleapis.com/token",
  "code_challenge_required": true
}'::jsonb),
('Notion', 'notion', '{
  "client_id": "",
  "client_secret": "",
  "auth_url": "https://api.notion.com/v1/oauth/authorize",
  "token_url": "https://api.notion.com/v1/oauth/token",
  "code_challenge_required": false
}'::jsonb),
('Airtable', 'airtable', '{
  "client_id": "",
  "client_secret": "",
  "auth_url": "https://airtable.com/oauth2/v1/authorize",
  "token_url": "https://airtable.com/oauth2/v1/token",
  "code_challenge_required": true
}'::jsonb);