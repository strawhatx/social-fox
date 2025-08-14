import { supabase } from "../../utils/supabase.ts";
import OAuth from "npm:oauth-1.0a";
import CryptoJS from "https://esm.sh/crypto-js@4.2.0";
import { ProcessOauthStrategy } from "./index.ts";

export class TwitterStrategy implements ProcessOauthStrategy {
    private createOAuth1Client(consumerKey: string, consumerSecret: string) {
        return new OAuth({
            consumer: { key: consumerKey, secret: consumerSecret },
            signature_method: "HMAC-SHA1",
            hash_function(base_string, key) {
                return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
            },
        });
    }

    private async saveRequestTokenSecret(userId: string, oauth_token: string, oauth_token_secret: string, project_id: string) {
        const key = `twitter_oauth1:${oauth_token}`;
        const value = {
            user_id: userId,
            project_id,
            oauth_token_secret,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        };
        const { error } = await supabase
            .from("kv_store")
            .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
    }

    // config: { provider: 'twitter_oauth1', project_id: string }
    async handleRequest(req: Request, body: Record<string, any>): Promise<string> {
        const { provider, project_id, user_id } = body;
        if (!project_id || !provider || !user_id)
            throw new Error('Missing required parameters project_id, provider, user_id');


        // Fetch integration config (consumer key/secret)
        const { data: integration, error: integrationError } = await supabase
            .from("integrations")
            .select("*")
            .eq("provider", provider)
            .single();
        if (!integration || integrationError) throw new Error("Integration not found");

        const { consumer_key, auth_url, request_token_url } = integration.config_public;
        const { consumer_secret } = integration.secrets;
        const oauth = this.createOAuth1Client(consumer_key, consumer_secret);

        const requestTokenRes = await fetch(request_token_url, {
            method: "POST",
            headers: oauth.toHeader(oauth.authorize({ url: request_token_url, method: "POST" })),
        });

        const requestTokenText = await requestTokenRes.text();
        const urlParams = new URLSearchParams(requestTokenText);
        const oauth_token = urlParams.get("oauth_token");
        const oauth_token_secret = urlParams.get("oauth_token_secret");
        if (!oauth_token || !oauth_token_secret) throw new Error("Failed to get request token");

        await this.saveRequestTokenSecret(user_id, oauth_token, oauth_token_secret, project_id);

        const oauthUrl = `${auth_url}?oauth_token=${oauth_token}`;
        console.log('OAuth URL:', oauthUrl);
        return oauthUrl;
    }
}
