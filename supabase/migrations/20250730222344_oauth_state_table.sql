-- Create oauth_states table for storing OAuth state and PKCE verifiers
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_hash TEXT NOT NULL UNIQUE,
  state_data JSONB NOT NULL,
  pkce_verifier TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_oauth_states_state_hash ON public.oauth_states(state_hash);
CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);
CREATE INDEX idx_oauth_states_user_id ON public.oauth_states(user_id);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create policies - users can only access their own OAuth states
CREATE POLICY "Users can manage their own OAuth states" 
ON public.oauth_states 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to clean up expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_states 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired states (optional)
-- This would need to be set up in your Supabase dashboard or via cron 