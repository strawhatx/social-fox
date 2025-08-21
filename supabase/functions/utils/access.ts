import { createClient } from "npm:@supabase/supabase-js@2";
import { getMasterKey } from "./vault.ts";
import { encrypt } from "./encryption.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

interface Integration {
    token_url: string;
    client_id: string;
    client_secret: string;
}

interface Connection {
    id: string;
    project_id: string;
    integration_id: string;
    config_public: Record<string, unknown>;
    secrets: Record<string, unknown>;
    status: string;
    created_at: string;
}

export async function getValidAccessToken(connection: Connection): Promise<string> {
    // 1) Load connection data
    if (!connection) {
        throw new Error("Connection not found");
    }

    // 2) Load connection data
    const { secrets, config_public } = connection;
    const { access_token_expires_at, refresh_token_expires_at } = config_public;
    const { access_token, refresh_token } = secrets;

    const now = Date.now();

    // 3) Check if accesstoken is valid
    if (!access_token_expires_at || access_token_expires_at && now < (access_token_expires_at as number) - 60 * 1000) {
        // token valid for at least another minute
        return access_token as string;
    }

    // 4) If no refresh token or if its expired  users has to re-connect
    if (!refresh_token || refresh_token_expires_at && now > (refresh_token_expires_at as number)) {
        // 4.1) first update connection status to expired
        const { error: updateError } = await supabase
            .from("connections")
            .update({ status: "expired" })
            .eq("id", connection.id);

        if (updateError) {
            throw new Error("Failed to update connection status");
        }

        // 4.2) throw error to trigger re-connect
        throw new Error("Refresh token expired");
    }

    // 5) Load integration details
    const { data: integrationData, error: integrationError } = await supabase
        .from("integrations")
        .select("config_public, secrets")
        .eq("id", connection.integration_id)
        .single();

    if (integrationError || !integrationData) {
        throw new Error("Integration config not found");
    }

    const integration: Integration = {
        token_url: integrationData.config_public.token_url,
        client_id: integrationData.config_public.client_id,
        client_secret: integrationData.secrets.client_secret
    };

    // 6) Refresh the token
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token as string,
        client_id: integration.client_id,
        client_secret: integration.client_secret,
    });

    const response = await fetch(integration.token_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const tokenData = await response.json();
    const newAccessToken = tokenData.access_token;
    const newExpiresAt = Date.now() + tokenData.expires_in * 1000;

    // 7) Re-encrypt secrets & update
    const masterKey = getMasterKey();

    const plaintextSecrets = JSON.stringify({
        ...secrets,
        access_token: newAccessToken,
    });

    const encryptedSecrets = await encrypt(plaintextSecrets, masterKey);

    const updateData = {
        config_public: {
            ...config_public,
            access_token: newAccessToken,
            expires_at: newExpiresAt,
            refresh_token: tokenData.refresh_token || refresh_token,
        },
        secrets: {
            v: 1,
            alg: 'AES-256-GCM',
            encrypted: encryptedSecrets
        }
    }

    // 8) Update Supabase
    const { error: updateError } = await supabase
        .from("connections")
        .update(updateData)
        .eq("id", connection.id);

    if (updateError) {
        throw new Error("Failed to update token in database");
    }

    return newAccessToken;
}
