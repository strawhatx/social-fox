import { supabase } from "../../utils/supabase.ts";
import { ProcessOauthStrategy } from "./index";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkce-utils.ts";
import { saveOAuthState, savePkceVerifier } from "../utils/state.ts";

interface OAuthCallbackRequest {
    project_id: string;
    provider: string;
    [key: string]: string;
}

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


export interface Integration {
    id: string;
    icon: string;
    name: string;
    description: string;
    type: IntegrationType;
    provider: string;
    config_public: {
        client_id: string;
        auth_url: string;
        token_url: string;
        redirect_url: string;
        scopes: string[];
        required_fields: string[];
        required_parameters: string[];
        code_challenge_required: boolean;
    };
    secrets?: {
        client_secret?: string;
    };
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

enum IntegrationType {
    OAUTH = 'oauth',
    API = 'api',
}

export class DefaultStrategy implements ProcessOauthStrategy {
    // Get provider configuration from database
    private async getProviderConfig(integration: Integration): Promise<ProviderConfig | null> {
        // All integrations with OAuth config are supported - don't filter by type
        // since integrations can be data_source, publishing_platform, etc.

        const config = integration.config_public;

        return {
            type: "oauth", // Always oauth for these integrations
            config: {
                clientId: config.client_id || '',
                authUrl: config.auth_url || '',
                tokenUrl: config.token_url || '',
                scopes: config.scopes || [],
                requiredParameters: config.required_parameters || [],
                description: integration.description,
                redirectUrl: config.redirect_url,
                code_challenge_required: config.code_challenge_required || false
            }
        };
    }

    // Dynamic OAuth parameter builder
    private buildOAuthParameters(
        providerConfig: OAuthProviderConfig,
        redirectUri: string,
        state: string,
        params: Record<string, string>,
        provider: string
    ): Record<string, string> {
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
    }

    // Build OAuth URL dynamically
    private buildOAuthUrl(
        authUrl: string,
        parameters: Record<string, string>
    ): string {
        const url = new URL(authUrl);

        // Add all parameters to the URL
        for (const [key, value] of Object.entries(parameters)) {
            if (value && value.trim() !== '') {
                url.searchParams.append(key, value);
            }
        }

        return url.toString();
    }

    // Helper function to get provider-specific parameters
    private getProviderSpecificParameters(provider: string): Record<string, string> {
        const providerParams: Record<string, Record<string, string>> = {
            'gmail': {
                access_type: 'offline',
                prompt: 'consent'
            },
            'github': {
                prompt: 'consent'
            },
            'twitter': {},
            'linkedin': {
                prompt: 'consent'
            }
        };

        return providerParams[provider] || {};
    }

    // Initiate OAuth flow
    public async initiate(
        provider: string,
        integration: Integration,
        params: Record<string, string>,
        userId: string
    ): Promise<string> {
        const providerConfig = (await this.getProviderConfig(integration))?.config;
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

            console.log('Generated PKCE:', {
                code_verifier_length: code_verifier.length,
                code_challenge_length: code_challenge.length,
                provider: provider
            });
        } else {
            console.log('PKCE not required for provider:', provider);
        }

        // Construct auth URL with placeholders replaced
        let authUrl = providerConfig.authUrl;
        for (const [key, value] of Object.entries(params)) {
            authUrl = authUrl.replace(`{${key}}`, value);
        }

        // Build redirect URI - use the correct app domain
        const redirectUri = providerConfig.redirectUrl;

        if (!redirectUri) {
            throw new Error(`Missing redirect URL for provider: ${provider}`);
        }

        // Build state parameter with connection info and security measures
        const state = btoa(JSON.stringify({
            provider,
            redirectUri,
            timestamp: Date.now(),
            nonce: Math.random().toString(36).substring(2, 15),
            user_id: userId,
            project_id: params.project_id, // Include project_id for callback
            agent_type: params.agent_type, // Include agent_type for callback
            ...params
        }));

        // Store state and PKCE verifier in database for verification
        console.log('Storing OAuth state and PKCE verifier...');
        await saveOAuthState(state, userId);
        if (code_verifier) {
            await savePkceVerifier(state, userId, code_verifier);
            console.log('PKCE verifier stored successfully');
        } else {
            console.log('No PKCE verifier to store');
        }

        // Build OAuth parameters dynamically
        const oauthParameters = this.buildOAuthParameters(providerConfig, redirectUri, state, params, provider);

        // Add project_id as a separate parameter
        oauthParameters.project_id = params.project_id;

        // Build the final OAuth URL
        const finalUrl = this.buildOAuthUrl(authUrl, oauthParameters);

        return finalUrl;
    }

    // Main handler
    public async handleRequest(req: Request): Promise<Response> {
        try {
            const { project_id, provider, user_id, ...params } = await req.json() as OAuthCallbackRequest;
            if (!project_id || !provider || !user_id)
                throw new Error('Missing required parameters project_id, provider, user_id');

            // Fetch integration configuration from database
            const { data: integrationData, error: integrationError } = await supabase
                .from('integrations')
                .select('*')
                .eq('provider', provider)
                .single();

            if (integrationError || !integrationData) {
                throw new Error(`Integration not found: ${provider}`);
            }

            const oauthUrl = await this.initiate(provider, integrationData, { ...params, project_id }, user.id);

            return oauthUrl
        } catch (error) {
            console.error('Process OAuth error:', error);
            throw error;
        }
    }
}