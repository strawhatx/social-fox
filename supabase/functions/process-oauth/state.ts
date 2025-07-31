// Server-side OAuth state management for edge functions
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function to create a hash of the state for storage
const createStateHash = async (state: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(state);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const saveOAuthState = async (state: string, userId: string, expiresInMinutes: number = 60) => {
  const stateHash = await createStateHash(state);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state_hash: stateHash,
      state_data: { state, user_id: userId },
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    throw new Error(`Failed to save OAuth state: ${error.message}`);
  }
};

export const savePkceVerifier = async (state: string, userId: string, verifier: string) => {
  const stateHash = await createStateHash(state);
  
  const { error } = await supabase
    .from('oauth_states')
    .update({ pkce_verifier: verifier })
    .eq('state_hash', stateHash);

  if (error) {
    throw new Error(`Failed to save PKCE verifier: ${error.message}`);
  }
};

export const getOAuthState = async (state: string, userId: string): Promise<string | null> => {
  const stateHash = await createStateHash(state);
  
  const { data, error } = await supabase
    .from('oauth_states')
    .select('state_data')
    .eq('state_hash', stateHash)
    .single();

  if (error || !data) {
    return null;
  }

  // Verify the user_id matches
  if (data.state_data?.user_id !== userId) {
    return null;
  }

  return data.state_data?.state || null;
};

export const getPkceVerifier = async (state: string, userId: string): Promise<string | null> => {
  const stateHash = await createStateHash(state);
  
  const { data, error } = await supabase
    .from('oauth_states')
    .select('pkce_verifier, state_data')
    .eq('state_hash', stateHash)
    .single();

  if (error || !data) {
    return null;
  }

  // Verify the user_id matches
  if (data.state_data?.user_id !== userId) {
    return null;
  }

  return data.pkce_verifier || null;
};

export const clearOAuthState = async (state: string, userId: string) => {
  const stateHash = await createStateHash(state);
  
  await supabase
    .from('oauth_states')
    .delete()
    .eq('state_hash', stateHash);
};

export const clearPkceVerifier = async (state: string, userId: string) => {
  const stateHash = await createStateHash(state);
  
  await supabase
    .from('oauth_states')
    .update({ pkce_verifier: null })
    .eq('state_hash', stateHash);
};