// Server-side OAuth state management for edge functions (via kv_store)
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

    // No TTL index in kv_store; perform time-based cleanup by scanning keys with expiry
    const cutoffIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('kv_store')
      .select('key, value')
      .limit(1000);

    if (error) {
      console.error('Failed to cleanup expired states:', error);
      return { success: false, error: error.message };
    }

    const expiredKeys = (data || [])
      .filter((row: any) => row.value?.expires_at && row.value.expires_at < cutoffIso)
      .map((row: any) => row.key);

    for (const key of expiredKeys) {
      await supabase.from('kv_store').delete().eq('key', key);
    }

    console.log(`Cleaned up ${expiredKeys.length} expired OAuth states`);
    return { success: true, cleanedCount: expiredKeys.length };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const saveOAuthState = async (state: string, userId: string, expiresInMinutes: number = 60) => {
  const stateHash = await createStateHash(state);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const key = `oauth:${stateHash}`;
  const value = { state, user_id: userId, expires_at: expiresAt };

  const { error } = await supabase
    .from('kv_store')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    console.error('Failed to save OAuth state:', error);
    throw new Error(`Failed to save OAuth state: ${error.message}`);
  }
};

export const savePkceVerifier = async (state: string, _userId: string, verifier: string) => {
  const stateHash = await createStateHash(state);
  const key = `oauth:${stateHash}`;

  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;

  const updated = { ...(data?.value || {}), pkce_verifier: verifier };
  const { error: upsertError } = await supabase
    .from('kv_store')
    .upsert({ key, value: updated, updated_at: new Date().toISOString() });

  if (upsertError) throw upsertError;
};

// Combined function to get both OAuth state and PKCE verifier in one database query
export const getOAuthData = async (state: string, userId: string): Promise<{ state: string | null; pkceVerifier: string | null } | null> => {
  const stateHash = await createStateHash(state);
  const key = `oauth:${stateHash}`;

  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data?.value) return null;

  const value = data.value as any;
  if (value.expires_at && new Date(value.expires_at) < new Date()) return null;
  if (value.user_id !== userId) return null;

  return {
    state: value.state || null,
    pkceVerifier: value.pkce_verifier || null
  };
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
export const clearOAuthState = async (state: string, _userId: string) => {
  const stateHash = await createStateHash(state);
  const key = `oauth:${stateHash}`;
  await supabase.from('kv_store').delete().eq('key', key);
};

// Alias for backward compatibility - both state and PKCE verifier are cleared together
export const clearPkceVerifier = clearOAuthState;