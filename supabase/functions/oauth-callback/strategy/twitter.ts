import { supabase } from "../../utils/supabase.ts";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { ProcessOauthStrategy } from "./index";

export class TwitterStrategy implements OAuthCallbackStrategy {

    private createOAuth1Client(consumerKey: string, consumerSecret: string) {
        return new OAuth({
            consumer: { key: consumerKey, secret: consumerSecret },
            signature_method: "HMAC-SHA1",
            hash_function(base_string, key) {
                return crypto.createHmac("sha1", key).update(base_string).digest("base64");
            }
        });
    };


    public async handleRequest(req: Request): Promise<string> {
        if (req.method !== "GET") {
            throw new Error("Method Not Allowed");
        }

        try {
            const url = new URL(req.url);
            const oauth_token = url.searchParams.get("oauth_token");
            const oauth_verifier = url.searchParams.get("oauth_verifier");

            if (!oauth_token || !oauth_verifier) {
                throw new Error("Missing oauth_token or oauth_verifier");
            }

            // Fetch integration config (consumer key/secret)
            const { data: integration, error: integrationError } = await this.supabase
                .from("integrations")
                .select("*")
                .eq("provider", provider)
                .single();
            if (!integration || integrationError) throw new Error("Integration not found");

            const { consumer_key, request_token_url, access_token_url } = integration.config_public;
            const { consumer_secret } = integration.secrets;

            // Get temp secret from DB
            const { data: tokenData, error: tokenError } = await supabase
                .from("kv_store")
                .select("*")
                .eq("key", `twitter_oauth1:${oauth_token}`)
                .single();

            if (tokenError || !tokenData) {
                throw new Error("No matching temp token found");
            }

            const consumerKey = consumer_key;
            const consumerSecret = consumer_secret;
            const oauth_token_secret = tokenData.oauth_token_secret;
            const user_id = tokenData.user_id;
            const project_id = tokenData.project_id;

            const oauth = createOAuth1Client(consumerKey, consumerSecret);

            // Step 3: Exchange temp token for access token
            const accessTokenRes = await fetch(access_token_url, {
                method: "POST",
                headers: oauth.toHeader(
                    oauth.authorize(
                        {
                            url: access_token_url,
                            method: "POST",
                            data: { oauth_verifier }
                        },
                        { key: oauth_token, secret: oauth_token_secret }
                    )
                )
            });

            const accessTokenText = await accessTokenRes.text();
            const params = new URLSearchParams(accessTokenText);
            const final_access_token = params.get("oauth_token");
            const final_access_secret = params.get("oauth_token_secret");
            const screen_name = params.get("screen_name");
            const twitter_user_id = params.get("user_id");

            if (!final_access_token || !final_access_secret) {
                throw new Error("Failed to get final access token");
            }

            // Separate public config from secrets
            const publicConfig = {
                screen_name,
                twitter_user_id,
                provider,
                timestamp: new Date().toISOString(),
            };

            const masterKey = getMasterKey();

            const plaintextSecrets = JSON.stringify({
                access_token: final_access_token,
                access_secret: final_access_secret,
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

            // Store permanent user token/secret for posting later
            await supabase
                .from('connections')
                .upsert({
                    id: existingConnection?.id,
                    project_id: project_id,
                    integration_id: integration.id,
                    config_public: mergedPublicConfig,
                    secrets: secretsConfig,
                    is_active: true,
                    status: 'connected'
                }, {
                    onConflict: 'project_id,integration_id'
                })
                .select();

            return "Twitter connected! You can close this window.";

        } catch (err) {
            throw err;
        }
    }

}
