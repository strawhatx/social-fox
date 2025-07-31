// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";

import { applyRateLimit } from "../utils/rate-limiter.ts";
import { clearOAuthState, clearPkceVerifier, getOAuthState, getPkceVerifier } from "../utils/state.ts";

// Types
interface OAuthCallbackRequest {
  code: string;
  state: string;
  provider: string;
  [key: string]: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface Connector {
  id: string;
  name: string;
  provider: string;
  client_id: string;
  client_secret: string;
  token_url: string;
  auth_url: string;
  code_challenge_required: boolean;
}

interface StateData {
  user_id: string;
  redirectUri: string;
}

// ✅ Load Environment Variables
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));


const createErrorResponse = (message: string, req: Request, status = 400) => {
  return new Response(
    JSON.stringify({ error: message }),
    { headers: handleReturnCORS(req), status }
  );
};

const createSuccessResponse = (data: unknown, req: Request) => {
  return new Response(
    JSON.stringify(data),
    { headers: handleReturnCORS(req), status: 200 }
  );
};

const prepareTokenRequest = (
  connector: Connector,
  code: string,
  code_verifier: string,
  stateData: StateData
): RequestInit => {
  const baseConfig: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const bodyConfig = {
    code,
    redirect_uri: stateData.redirectUri,
    grant_type: 'authorization_code',
  }

  if (connector.code_challenge_required && code_verifier) {
    bodyConfig['code_verifier'] = code_verifier;
  }

  return {
    ...baseConfig,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${connector.client_id}:${connector.client_secret}`)}`
    },
    body: new URLSearchParams(bodyConfig).toString()
  };
};

// Main handler
serve(async (req) => {
  // Apply rate limiting first
  const rateLimitResponse = await applyRateLimit(req, 'oauth-callback');
  if (rateLimitResponse) return rateLimitResponse;

  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Handle both GET (OAuth redirect) and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    let project_id, provider, code, state, params;
    
    if (req.method === 'GET') {
      // Handle OAuth redirect from provider (GET request with query params)
      const url = new URL(req.url);
      code = url.searchParams.get('code');
      state = url.searchParams.get('state');
      project_id = url.searchParams.get('project_id'); // Get project_id from query params
      
      if (!code || !state) {
        throw new Error('Missing required OAuth parameters');
      }
      
      // Extract provider from state
      const decodedState = JSON.parse(atob(state));
      console.log('Decoded state from GET request:', decodedState);
      provider = decodedState.provider;
    } else {
      // Handle POST request with JSON body
      const body = await req.json() as OAuthCallbackRequest;
      ({ project_id, provider, code, state, params } = body);
    }
    
    // Validate required parameters
    if (!provider) {
      throw new Error('Provider not specified');
    }
    
    if (!project_id) {
      throw new Error('Project ID not found in request');
    }
    
    // Extract user ID from state parameter (OAuth callbacks don't have auth headers)
    const decodedState = req.method === 'GET' ? JSON.parse(atob(state)) : JSON.parse(atob(state));
    const userId = decodedState.user_id;
    const agentType = decodedState.agent_type || 'lead_generator';

    // Verify state parameter from database
    const storedState = await getOAuthState(state, userId);
    if (!storedState || storedState !== state) {
      throw new Error("Invalid state parameter");
    }
    await clearOAuthState(state, userId);
    
    // Verify timestamp
    if (Date.now() - decodedState.timestamp > 3600000) { // 1 hour
      throw new Error("OAuth state expired");
    }

    // Retrieve code_verifier from database
    const code_verifier = await getPkceVerifier(state, userId);
    await clearPkceVerifier(state, userId);

    
    // Fetch integration configuration
    const { data: integrationData, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('provider', provider)
      .single();

    if (integrationError || !integrationData) {
      throw new Error('Integration not found');
    }

    //process the data properly to the connector type
    const connector: Connector = {
      token_url: integrationData.config_data?.token_url,
      client_id: integrationData.config_data?.client_id,
      client_secret: integrationData.config_data?.client_secret,
    }

    // Use the already decoded state data
    const stateData = decodedState as StateData;

    // Process token URL for provider-specific templates
    let tokenUrl = connector.token_url;

    // Exchange code for tokens
    const tokenRequestConfig = prepareTokenRequest(connector, code, code_verifier || '', stateData);
    const tokenResponse = await fetch(tokenUrl, tokenRequestConfig);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json() as TokenResponse;
      console.error('Token exchange failed:', {
        provider,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      });
      throw new Error(
        `Failed to exchange token: ${errorData.error_description || tokenResponse.statusText}`
      );
    }

    const tokenData = await tokenResponse.json() as TokenResponse;

    const connectionConfig = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
      provider,
      timestamp: new Date().toISOString()
    };

    // Get existing config first to merge provider data
    const { data: existingConfig } = await supabase
      .from('agent_configs')
      .select('config_data')
      .eq('project_id', project_id)
      .eq('agent_type', agentType)
      .eq('config_type', 'main')
      .single();

    // Merge with existing config
    const mergedConfigData = existingConfig?.config_data || {};
    mergedConfigData[provider] = {
      ...mergedConfigData[provider],
      ...connectionConfig,
    };

    // Upsert connection record (create if doesn't exist, update if it does)
    console.log('About to insert with project_id:', project_id, 'agent_type:', agentType, 'provider:', provider);
    const { data, error } = await supabase
      .from('agent_configs')
      .upsert([{
        project_id: project_id,
        agent_type: agentType,
        config_type: 'main',
        config_data: mergedConfigData,
      }], {
        onConflict: 'project_id,agent_type,config_type'
      })
      .select();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data[0], req);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred', req);
  }
});