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
  };

  if (connector.code_challenge_required && code_verifier) {
    bodyConfig['code_verifier'] = code_verifier;
  }

  // Provider-specific token request configuration
  if (connector.provider === 'github') {
    // GitHub uses client_id and client_secret in the body
    bodyConfig['client_id'] = connector.client_id;
    bodyConfig['client_secret'] = connector.client_secret;
    
    return {
      ...baseConfig,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(bodyConfig).toString()
    };
  } else if (connector.provider === 'gmail' || connector.provider === 'google_sheets') {
    // Google OAuth uses client credentials in body
    bodyConfig['client_id'] = connector.client_id;
    bodyConfig['client_secret'] = connector.client_secret;
    
    return {
      ...baseConfig,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(bodyConfig).toString()
    };
  } else if (connector.provider === 'twitter') {
    // Twitter uses Basic Auth with client credentials
    bodyConfig['client_id'] = connector.client_id;
    
    return {
      ...baseConfig,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${connector.client_id}:${connector.client_secret}`)}`
      },
      body: new URLSearchParams(bodyConfig).toString()
    };
  } else {
    // Default OAuth implementation
    return {
      ...baseConfig,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${connector.client_id}:${connector.client_secret}`)}`
      },
      body: new URLSearchParams(bodyConfig).toString()
    };
  }
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
      
      if (!code || !state) {
        throw new Error('Missing required OAuth parameters');
      }
      
      // Extract provider and project_id from state
      const decodedState = JSON.parse(atob(state));
      console.log('Decoded state from GET request:', decodedState);
      provider = decodedState.provider;
      project_id = decodedState.project_id;
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
      id: integrationData.id,
      name: integrationData.name,
      provider: integrationData.provider,
      token_url: integrationData.config_public?.token_url,
      client_id: integrationData.config_public?.client_id,
      client_secret: integrationData.secrets?.client_secret,
      auth_url: integrationData.config_public?.auth_url,
      code_challenge_required: integrationData.config_public?.code_challenge_required || false
    };

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

    // Separate public config from secrets
    const publicConfig = {
      code,
      state,
      scope: tokenData.scope || (integrationData.config_public?.scopes || []).join(' '),
      provider,
      timestamp: new Date().toISOString(),
      // Include any additional parameters from the state (like git_url, repository for GitHub)
      ...Object.fromEntries(
        Object.entries(decodedState).filter(([key]) => 
          !['provider', 'project_id', 'user_id', 'redirectUri', 'timestamp', 'nonce', 'connectionName'].includes(key)
        )
      )
    };

    const secretsConfig = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
    };

    // Get the integration to find the connection
    const { data: existingConnection, error: connectionError } = await supabase
      .from('connections')
      .select('*')
      .eq('project_id', project_id)
      .eq('integration_id', integrationData.id)
      .maybeSingle();

    if (connectionError && connectionError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch existing connection: ${connectionError.message}`);
    }

    // Create or update the connection with OAuth data
    const { data, error } = await supabase
      .from('connections')
      .upsert({
        id: existingConnection?.id,
        project_id: project_id,
        integration_id: integrationData.id,
        config_public: publicConfig,
        secrets: secretsConfig,
        is_active: true
      }, {
        onConflict: 'project_id,integration_id'
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