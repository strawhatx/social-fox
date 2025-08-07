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

// Manual cleanup function for expired states (can be called when needed)
export const cleanupExpiredStates = async () => {
  try {
    console.log('Cleaning up expired OAuth states...');
    
    const { count, error } = await supabase
      .from('oauth_states')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Failed to cleanup expired states:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Cleaned up ${count || 0} expired OAuth states`);
    return { success: true, cleanedCount: count || 0 };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const saveOAuthState = async (state: string, userId: string, expiresInMinutes: number = 60) => {
  
  const stateHash = await createStateHash(state);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  console.log('Saving OAuth state:', {
    stateHash: stateHash.substring(0, 8) + '...',
    userId,
    expiresAt: expiresAt.toISOString()
  });
  
  console.log('Attempting to insert OAuth state with data:', {
    state_hash: stateHash.substring(0, 8) + '...',
    state_data: { state: state.substring(0, 20) + '...', user_id: userId },
    expires_at: expiresAt.toISOString()
  });

  const { data, error } = await supabase
    .from('oauth_states')
    .insert({
      state_hash: stateHash,
      state_data: { state, user_id: userId },
      expires_at: expiresAt.toISOString()
    })
    .select();

  if (error) {
    console.error('Failed to save OAuth state:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Failed to save OAuth state: ${error.message}`);
  }
  
  console.log('OAuth state insert result:', data);
  
  console.log('OAuth state saved successfully');
};

export const savePkceVerifier = async (state: string, userId: string, verifier: string) => {
  const stateHash = await createStateHash(state);
  
  console.log('Saving PKCE verifier:', {
    stateHash: stateHash.substring(0, 8) + '...',
    verifierLength: verifier.length
  });
  
  console.log('Attempting to update PKCE verifier for state hash:', stateHash.substring(0, 8) + '...');

  const { data, error } = await supabase
    .from('oauth_states')
    .update({ pkce_verifier: verifier })
    .eq('state_hash', stateHash)
    .select();

  if (error) {
    console.error('Failed to save PKCE verifier:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error(`Failed to save PKCE verifier: ${error.message}`);
  }
  
  console.log('PKCE verifier update result:', data);
  
  console.log('PKCE verifier saved successfully');
};

// Combined function to get both OAuth state and PKCE verifier in one database query
export const getOAuthData = async (state: string, userId: string): Promise<{ state: string | null; pkceVerifier: string | null } | null> => {
  const stateHash = await createStateHash(state);
  
  console.log('Retrieving OAuth data:', {
    stateHash: stateHash.substring(0, 8) + '...',
    userId
  });
  
  const { data, error } = await supabase
    .from('oauth_states')
    .select('state_data, pkce_verifier, expires_at')
    .eq('state_hash', stateHash)
    .single();

  if (error || !data) {
    console.log('OAuth data not found or error:', error);
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    console.log('OAuth state expired');
    return null;
  }

  // Verify the user_id matches
  if (data.state_data?.user_id !== userId) {
    console.log('User ID mismatch:', {
      expected: userId,
      actual: data.state_data?.user_id
    });
    return null;
  }

  const result = {
    state: data.state_data?.state || null,
    pkceVerifier: data.pkce_verifier || null
  };

  console.log('OAuth data retrieved successfully:', {
    hasState: !!result.state,
    hasPkceVerifier: !!result.pkceVerifier,
    pkceVerifierLength: result.pkceVerifier?.length || 0
  });

  return result;
};

// Individual functions for backward compatibility (now just call the combined function)
export const getOAuthState = async (state: string, userId: string): Promise<string | null> => {
  const data = await getOAuthData(state, userId);
  return data?.state || null;
};

export const getPkceVerifier = async (state: string, userId: string): Promise<string | null> => {
  const data = await getOAuthData(state, userId);
  return data?.pkceVerifier || null;
};

// Single cleanup function that removes the entire OAuth state record
export const clearOAuthState = async (state: string, userId: string) => {
  const stateHash = await createStateHash(state);
  
  console.log('Clearing OAuth state:', {
    stateHash: stateHash.substring(0, 8) + '...',
    userId
  });
  
  const { error } = await supabase
    .from('oauth_states')
    .delete()
    .eq('state_hash', stateHash);

  if (error) {
    console.error('Failed to clear OAuth state:', error);
  } else {
    console.log('OAuth state cleared successfully');
  }
};

// Alias for backward compatibility - both state and PKCE verifier are cleared together
export const clearPkceVerifier = clearOAuthState;