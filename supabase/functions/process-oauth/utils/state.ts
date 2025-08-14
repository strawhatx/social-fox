import { supabase } from "../../utils/supabase.ts";

export async function saveOAuthState(state: string, userId: string) {
    const { error } = await supabase
        .from('oauth_states')
        .insert({
            state,
            user_id: userId,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });
    
    if (error) {
        console.error('Error saving OAuth state:', error);
        throw new Error('Failed to save OAuth state');
    }
}

export async function savePkceVerifier(state: string, userId: string, codeVerifier: string) {
    const { error } = await supabase
        .from('pkce_verifiers')
        .insert({
            state,
            user_id: userId,
            code_verifier: codeVerifier,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });
    
    if (error) {
        console.error('Error saving PKCE verifier:', error);
        throw new Error('Failed to save PKCE verifier');
    }
}

export async function getOAuthData(state: string) {
    // Get OAuth state
    const { data: stateData, error: stateError } = await supabase
        .from('oauth_states')
        .select('*')
        .eq('state', state)
        .single();
    
    if (stateError || !stateData) {
        throw new Error('Invalid or expired OAuth state');
    }
    
    // Get PKCE verifier if exists
    const { data: pkceData } = await supabase
        .from('pkce_verifiers')
        .select('*')
        .eq('state', state)
        .single();
    
    return {
        state: stateData,
        pkce: pkceData
    };
}

export async function clearOAuthState(state: string) {
    // Delete OAuth state
    await supabase
        .from('oauth_states')
        .delete()
        .eq('state', state);
    
    // Delete PKCE verifier
    await supabase
        .from('pkce_verifiers')
        .delete()
        .eq('state', state);
}