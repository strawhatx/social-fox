// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { generateCodeChallenge, generateCodeVerifier } from "./pkce-utils.ts";
import { saveOAuthState, savePkceVerifier } from "./state.ts";

// Types
interface OAuthCallbackRequest {
  team_id: string;
  connectionName: string;
  provider: string;
  [key: string]: string;
}

/**
 * Dynamic OAuth Service
 * 
 * This service provides a flexible, configuration-driven approach to OAuth URL building.
 * It supports different OAuth providers with their specific parameters without hardcoding.
 * 
 * Key Features:
 * - Dynamic parameter building based on provider configuration
 * - Support for PKCE (Proof Key for Code Exchange)
 * - Provider-specific parameter overrides
 * - Conditional parameter inclusion
 * - Easy extension for new OAuth providers
 * 
 * How to add a new OAuth provider:
 * 1. Add the provider to the ConnectorProvider type in types/connectors.ts
 * 2. Add provider-specific parameters to getProviderSpecificParameters()
 * 3. Configure the connector in the database with the required OAuth settings
 * 
 * Example usage:
 * ```typescript
 * const oauthUrl = await initiateOAuth(
 *   "My Connection",
 *   "google",
 *   connectorConfig,
 *   { team_id: "123" }
 * );
 * ```
 */

// OAuth configuration for different providers
interface OAuthProviderConfig {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  requiredParameters?: string[];
  description: string;
  redirectUrl?: string;
  code_challenge_required?: boolean;
  code_challenge?: string;
}

// Combined provider configurations
interface ProviderConfig {
  type: "oauth";
  config: OAuthProviderConfig;
}

// Dynamic OAuth parameter configuration
interface OAuthParameterConfig {
  [key: string]: {
    value: string | (() => string);
    required?: boolean;
    conditional?: (config: OAuthProviderConfig) => boolean;
  };
}

export enum IntegrationType {
  OAUTH = 'oauth',
  API = 'api',
}

export enum IntegrationProvider {
  GMAIL = 'gmail',
  GOOGLE_SHEETS = 'google_sheets',
}

export interface Integration {
  id: string;
  icon: string;
  name: string;
  description: string;
  type: IntegrationType;
  provider: IntegrationProvider;
  client_id: string;
  auth_url: string;
  token_url: string;
  redirect_url: string;
  scopes: string[];
  required_fields: string[];
  required_parameters: string[];
  code_challenge_required: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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


// Get provider configuration from database
const getProviderConfig = async (integration: Integration): Promise<ProviderConfig | null> => {
  if (integration.type !== IntegrationType.OAUTH) {
    return null;
  }

  return {
    type: integration.type,
    config: {
      clientId: integration.client_id || '',
      authUrl: integration.auth_url || '',
      tokenUrl: integration.token_url || '',
      scopes: integration.scopes || [],
      requiredParameters: integration.required_parameters || [],
      description: integration.description,
      redirectUrl: integration.redirect_url,
      code_challenge_required: integration.code_challenge_required
    }
  };
};

// Dynamic OAuth parameter builder
const buildOAuthParameters = (
  providerConfig: OAuthProviderConfig,
  redirectUri: string,
  state: string,
  params: Record<string, string>,
  provider: string
): Record<string, string> => {
  const oauthParams: OAuthParameterConfig = {
    // Standard OAuth 2.0 parameters
    client_id: {
      value: providerConfig.clientId,
      required: true
    },
    redirect_uri: {
      value: redirectUri,
      required: true
    },
    response_type: {
      value: 'code',
      required: true
    },
    scope: {
      value: () => providerConfig.scopes.join(' '),
      required: true
    },
    state: {
      value: state,
      required: true
    },
    
    // PKCE parameters (conditional)
    code_challenge: {
      value: () => providerConfig.code_challenge || '',
      conditional: (config) => config.code_challenge_required === true
    },
    code_challenge_method: {
      value: 'S256',
      conditional: (config) => config.code_challenge_required === true
    },
  };

  // Build the final parameters object
  const finalParams: Record<string, string> = {};

  // Add standard OAuth parameters
  for (const [key, config] of Object.entries(oauthParams)) {
    // Check if parameter should be included based on conditional
    if (config.conditional && !config.conditional(providerConfig)) {
      continue;
    }

    // Get the value (either static string or function result)
    const value = typeof config.value === 'function' ? config.value() : config.value;
    
    // Only add if value is not empty
    if (value && value.trim() !== '') {
      finalParams[key] = value;
    }
  }

  // Add provider-specific parameters
  const providerSpecificParams = getProviderSpecificParameters(provider);
  Object.assign(finalParams, providerSpecificParams);

  // Add any additional parameters from the params object (these override defaults)
  Object.assign(finalParams, params);

  return finalParams;
};

// Build OAuth URL dynamically
const buildOAuthUrl = (
  authUrl: string,
  parameters: Record<string, string>
): string => {
  const url = new URL(authUrl);
  
  // Add all parameters to the URL
  for (const [key, value] of Object.entries(parameters)) {
    if (value && value.trim() !== '') {
      url.searchParams.append(key, value);
    }
  }
  
  return url.toString();
};

// Helper function to get provider-specific parameters
const getProviderSpecificParameters = (provider: string): Record<string, string> => {
  const providerParams: Record<string, Record<string, string>> = {
    'google_sheets': {
      access_type: 'offline',
      prompt: 'consent'
    }
  };

  return providerParams[provider] || {};
};

// Initiate OAuth flow
export const initiateOAuth = async (
  connectionName: string,
  provider: IntegrationProvider,
  config: Integration,
  params: Record<string, string>,
) => {
  const providerConfig = (await getProviderConfig(config))?.config;
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (!providerConfig.clientId) {
    throw new Error(`Missing OAuth configuration for ${provider}`);
  }

  // Check for required parameters
  if (providerConfig.requiredParameters) {
    for (const param of providerConfig.requiredParameters) {
      if (!params[param]) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }
  // Generate code_verifier and code_challenge
  let code_verifier: string = '';
  if (providerConfig.code_challenge_required) {
    code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);
    providerConfig.code_challenge = code_challenge;
  }

  // Construct auth URL with placeholders replaced
  let authUrl = providerConfig.authUrl;
  for (const [key, value] of Object.entries(params)) {
    authUrl = authUrl.replace(`{${key}}`, value);
  }

  // Build redirect URI
  const redirectUri = providerConfig.redirectUrl || `${window.location.origin}/auth/callback`;

  // Build state parameter with connection info and security measures
  const state = btoa(JSON.stringify({
    provider,
    connectionName,
    redirectUri,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 15),
    ...params
  }));

  // Store state in database for verification
  // Note: This will be called from the client side, not here in the edge function
  // The client should handle storing the state and verifier

  // Build OAuth parameters dynamically
  const oauthParameters = buildOAuthParameters(
    providerConfig,
    redirectUri,
    state,
    params,
    provider
  );

  // Build the final OAuth URL
  const finalUrl = buildOAuthUrl(authUrl, oauthParameters);

  return finalUrl;
};



// Main handler
serve(async (req) => {
  // Apply rate limiting first
  const rateLimitResponse = await applyRateLimit(req, 'oauth-callback');
  if (rateLimitResponse) return rateLimitResponse;

  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  // Validate the JWT token and get user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('Missing or invalid authorization header', req, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return createErrorResponse('Invalid or expired token', req, 401);
  }

  // if the request is not a POST request, return a 405 Method Not Allowed
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { team_id, connectionName, provider, ...params } = await req.json() as OAuthCallbackRequest;

    // Fetch integration configuration from database
    const { data: integrationData, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('name', provider)
      .single();

    if (integrationError || !integrationData) {
      throw new Error(`Integration not found: ${provider}`);
    }

    const oauthUrl = await initiateOAuth(connectionName, provider as IntegrationProvider, integrationData, params);
    
    return createSuccessResponse(oauthUrl, req);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred', req);
  }
});