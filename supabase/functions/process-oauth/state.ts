// Database-based OAuth state management for edge functions
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.177.0/hash/mod.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

// Helper function to create a hash of the state for storage
const createStateHash = (state: string): string => {
  const hash = createHash("sha256");
  hash.update(state);
  return hash.toString();
};

export const saveOAuthState = async (state: string, userId: string, expiresInMinutes: number = 60) => {
  const stateHash = createStateHash(state);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state_hash: stateHash,
      state_data: { state },
      user_id: userId,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    throw new Error(`Failed to save OAuth state: ${error.message}`);
  }
};

export const getOAuthState = async (state: string, userId: string): Promise<string | null> => {
  const stateHash = createStateHash(state);
  
  const { data, error } = await supabase
    .from('oauth_states')
    .select('state_data, expires_at')
    .eq('state_hash', stateHash)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    await clearOAuthState(state, userId);
    return null;
  }

  return data.state_data.state;
};

export const clearOAuthState = async (state: string, userId: string) => {
  const stateHash = createStateHash(state);
  
  const { error } = await supabase
    .from('oauth_states')
    .delete()
    .eq('state_hash', stateHash)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to clear OAuth state:', error);
  }
};

export const savePkceVerifier = async (state: string, verifier: string, userId: string) => {
  const stateHash = createStateHash(state);
  
  const { error } = await supabase
    .from('oauth_states')
    .update({ pkce_verifier: verifier })
    .eq('state_hash', stateHash)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to save PKCE verifier: ${error.message}`);
  }
};

export const getPkceVerifier = async (state: string, userId: string): Promise<string | null> => {
  const stateHash = createStateHash(state);
  
  const { data, error } = await supabase
    .from('oauth_states')
    .select('pkce_verifier, expires_at')
    .eq('state_hash', stateHash)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    await clearOAuthState(state, userId);
    return null;
  }

  return data.pkce_verifier;
};

export const clearPkceVerifier = async (state: string, userId: string) => {
  // This is handled by clearOAuthState since we store everything together
  await clearOAuthState(state, userId);
};