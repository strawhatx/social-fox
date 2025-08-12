-- Fix OAuth states security vulnerability
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow OAuth state operations" ON public.oauth_states;

-- Create secure policies that only allow users to access their own OAuth states
CREATE POLICY "Users can manage their own OAuth states"
ON public.oauth_states
FOR ALL
USING (
  -- Allow access only if the user_id in state_data matches the authenticated user
  (state_data->>'user_id')::uuid = auth.uid()
)
WITH CHECK (
  -- Same check for inserts/updates
  (state_data->>'user_id')::uuid = auth.uid()
);