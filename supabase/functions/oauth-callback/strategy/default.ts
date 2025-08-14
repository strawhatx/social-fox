import { supabase } from "../../utils/supabase.ts";
import { clearOAuthState, getOAuthData } from "../../utils/state.ts";
import { encrypt } from "../../utils/encryption.ts";
import { getMasterKey } from "../../utils/vault.ts";
import { OAuthCallbackStrategy } from "./index.ts";

// Types
interface OAuthCallbackRequest {
    code: string;
    state: string;
    provider: string;
    [key: string]: string;
}

interface TokenResponse {
    scope: string;
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

// Provider-specific configuration mapper
interface ProviderConfig {
    contentType: string;
    authMethod: 'basic' | 'body' | 'none';
    includeClientId: boolean;
    includeClientSecret: boolean;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    github: {
        contentType: 'application/x-www-form-urlencoded',
        authMethod: 'body',
        includeClientId: true,
        includeClientSecret: true
    },
    linkedin: {
        contentType: 'application/x-www-form-urlencoded',
        authMethod: 'body',
        includeClientId: true,
        includeClientSecret: true
    }
};

interface StateData {
    user_id: string;
    redirectUri: string;
}

export class DefaultStrategy implements OAuthCallbackStrategy {
    private prepareTokenRequest(
        connector: Connector,
        code: string,
        code_verifier: string,
        stateData: StateData
    ): RequestInit {
        // Get provider configuration
        const providerConfig = PROVIDER_CONFIGS[connector.provider] || {
            contentType: 'application/x-www-form-urlencoded',
            authMethod: 'basic',
            includeClientId: false,
            includeClientSecret: false
        };

        console.log('Provider config:', {
            provider: connector.provider,
            authMethod: providerConfig.authMethod,
            includeClientId: providerConfig.includeClientId,
            includeClientSecret: providerConfig.includeClientSecret
        });

        // Build base request body
        const bodyConfig: Record<string, string> = {
            code,
            redirect_uri: stateData.redirectUri,
            grant_type: 'authorization_code',
        };

        // Add PKCE verifier if required
        if (connector.code_challenge_required && code_verifier) {
            bodyConfig['code_verifier'] = code_verifier;
            console.log('Added code_verifier to request body');
        } else if (connector.code_challenge_required && !code_verifier) {
            console.error('PKCE required but no code_verifier found!');
        }

        if (providerConfig.includeClientId) {
            bodyConfig['client_id'] = connector.client_id;
        }
        if (providerConfig.includeClientSecret) {
            bodyConfig['client_secret'] = connector.client_secret;
        }

        // Build headers
        const headers: Record<string, string> = {
            'Content-Type': providerConfig.contentType
        };

        // Add authorization header if using Basic Auth
        if (providerConfig.authMethod === 'basic') {
            const credentials = `${connector.client_id}:${connector.client_secret}`;
            const encodedCredentials = btoa(credentials);
            headers['Authorization'] = `Basic ${encodedCredentials}`;
        }

        // Add Accept header for GitHub
        if (connector.provider === 'github') {
            headers['Accept'] = 'application/json';
        }

        console.log('Token request config:', {
            provider: connector.provider,
            authMethod: providerConfig.authMethod,
            hasAuthorization: !!headers['Authorization'],
            bodyKeys: Object.keys(bodyConfig)
        });

        return {
            method: 'POST',
            headers,
            body: new URLSearchParams(bodyConfig).toString()
        };
    };
    
    // Main handler
    public async handleRequest(req: Request): Promise<string> {
        try {
            let project_id, provider, code, state, params;

            // Handle both GET (OAuth redirect) and POST requests
            if (req.method !== 'GET' && req.method !== 'POST')
                throw new Error('Method Not Allowed');

            if (req.method === 'GET') {
                // Handle OAuth redirect from provider (GET request with query params)
                const url = new URL(req.url);
                code = url.searchParams.get('code');
                state = url.searchParams.get('state');

                if (!code || !state)
                    throw new Error('Missing required OAuth parameters');

                // Extract provider and project_id from state
                const decodedState = JSON.parse(atob(state));
                provider = decodedState.provider;
                project_id = decodedState.project_id;
            }
            else {
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

            // Get OAuth state and PKCE verifier from database in a single query
            const oauthData = await getOAuthData(state, userId);

            if (!oauthData) {
                throw new Error("OAuth state not found or expired");
            }

            const { state: storedState, pkceVerifier: code_verifier } = oauthData;

            if (!storedState || storedState !== state) {
                throw new Error("Invalid state parameter");
            }

            // Verify timestamp
            if (Date.now() - decodedState.timestamp > 3600000) { // 1 hour
                throw new Error("OAuth state expired");
            }

            // Clear the OAuth state (this clears both state and PKCE verifier since they're in the same record)
            await clearOAuthState(state, userId);

            console.log('Retrieved code_verifier:', code_verifier ? 'present' : 'missing');

            // Fetch integration configuration
            const { data: integrationData, error: integrationError } = await supabase
                .from('integrations')
                .select('*')
                .eq('provider', provider)
                .single();

            if (integrationError || !integrationData) {
                throw new Error('Integration not found');
            }

            console.log('Integration config:', {
                provider: integrationData.provider,
                code_challenge_required: integrationData.config_public?.code_challenge_required,
                has_client_secret: !!integrationData.secrets?.client_secret
            });

            // Process the data properly to the connector type
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

            console.log('Connector config:', {
                provider: connector.provider,
                code_challenge_required: connector.code_challenge_required,
                has_code_verifier: !!code_verifier
            });

            // Use the already decoded state data
            const stateData = decodedState as StateData;

            // Process token URL for provider-specific templates
            let tokenUrl = connector.token_url;

            // Exchange code for tokens
            const tokenRequestConfig = this.prepareTokenRequest(connector, code, code_verifier || '', stateData);
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
            const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
            const publicConfig = {
                code,
                state,
                access_token_expires_at: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
                refresh_token_expires_at: tokenData.refresh_token ? Date.now() + NINETY_DAYS_MS : null,
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

            // Derive repository details from state if provided by client (so repo config can be persisted atomically with OAuth)
            let repositoryFromState: { owner: string; owner_url: string; repository: string; repository_url: string } | undefined;
            const repoOwner = (decodedState as any).repository_owner || (decodedState as any).repo_owner || (decodedState as any).owner;
            const repoName = (decodedState as any).repository_name || (decodedState as any).repo_name || (decodedState as any).repository;
            if (repoOwner && repoName) {
                repositoryFromState = {
                    owner: repoOwner,
                    owner_url: `https://github.com/${repoOwner}`,
                    repository: repoName,
                    repository_url: `https://github.com/${repoOwner}/${repoName}`
                };
            }

            const masterKey = getMasterKey();

            const plaintextSecrets = JSON.stringify({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
            });

            const encryptedSecrets = await encrypt(plaintextSecrets, masterKey);

            const secretsConfig = {
                v: 1,
                alg: 'AES-256-GCM',
                encrypted: encryptedSecrets
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

            console.log('publicConfig before upsert:', publicConfig);

            // Create or update the connection with OAuth data
            // Merge with any existing public config to avoid overwriting fields like repository, initialized_at, etc.
            const mergedPublicConfig: Record<string, unknown> = {
                ...(existingConnection?.config_public ?? {}),
                ...publicConfig,
            };

            if (repositoryFromState) {
                (mergedPublicConfig as any).repository = repositoryFromState;
            }

            const { data, error } = await supabase
                .from('connections')
                .upsert({
                    id: existingConnection?.id,
                    project_id: project_id,
                    integration_id: integrationData.id,
                    config_public: mergedPublicConfig,
                    secrets: secretsConfig,
                    is_active: true,
                    status: 'connected'
                }, {
                    onConflict: 'project_id,integration_id'
                })
                .select();

            if (error) {
                throw error;
            }

            return "Twitter connected! You can close this window.";
        } catch (error) {
            console.error('OAuth callback error:', error);
            throw error;
        }
    }
}