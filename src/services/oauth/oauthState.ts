// Client-side OAuth state management that works with database storage
import { supabase } from '../../integrations/supabase/client';

// Helper function to create a hash of the state for storage
const createStateHash = async (state: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(state);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const saveOAuthState = async (state: string, expiresInMinutes: number = 60) => {
  const stateHash = await createStateHash(state);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state_hash: stateHash,
      state_data: { state },
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    throw new Error(`Failed to save OAuth state: ${error.message}`);
  }
};

export const savePkceVerifier = async (state: string, verifier: string) => {
  const stateHash = await createStateHash(state);
  
  const { error } = await supabase
    .from('oauth_states')
    .update({ pkce_verifier: verifier })
    .eq('state_hash', stateHash);

  if (error) {
    throw new Error(`Failed to save PKCE verifier: ${error.message}`);
  }
};

// Note: getOAuthState and getPkceVerifier are not needed on the client side
// as they're only used in the callback function (server-side) 