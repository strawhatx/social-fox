// File: functions/post-twitter/edge.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import CryptoJS from "https://esm.sh/crypto-js@4.2.0";
import { supabase } from "../utils/supabase.ts";
import { validateRequestAuthorization } from "../utils/auth.ts";

// Helper: generate OAuth1 header
function generateOAuth1Header({
  method,
  url,
  params,
  consumerKey,
  consumerSecret,
  accessToken,
  accessSecret,
}: {
  method: string;
  url: string;
  params: Record<string, string>;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessSecret: string;
}) {
  const oauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Merge all parameters for signature base
  const allParams = { ...params, ...oauth };
  const paramString = Object.keys(allParams)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`
    )
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join("&");

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(
    accessSecret
  )}`;

  const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(
    CryptoJS.enc.Base64
  );

  oauth.oauth_signature = signature;

  // Build Authorization header
  const authHeader =
    "OAuth " +
    Object.entries(oauth)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ");

  return authHeader;
}

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

// Edge function
serve(async (req) => {
  const rateLimitResponse = await applyRateLimit(req, 'post-twitter-content');
  if (rateLimitResponse) return rateLimitResponse;

  const cors = handleCORS(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, req, 405);
  }

  console.log('req', req);

  if (!validateRequestAuthorization(req)) {
    return jsonResponse({ error: 'Forbidden' }, req, 403);
  }

  try {
    const { connection_id, content } = await req.json();
    if (!connection_id || !content) {
      return new Response(
        JSON.stringify({ error: "Missing connection_id or content" }),
        { status: 400 }
      );
    }

    // Fetch tokens + consumer info from your DB
    const { data: connection, error } = await supabase
      .from("connections")
      .select('*')
      .eq("id", connection_id)
      .single();

    if (error || !connection) {
      return jsonResponse({ error: "Connection not found" }, req, 404);
    }

    // decrypt secrets
    const masterKey = getMasterKey();
    let decryptedSecrets: Record<string, unknown> | null = null;

    if (connection.secrets && connection.secrets.encrypted) {
      const plaintext = await decrypt(connection.secrets.encrypted, masterKey);
      decryptedSecrets = JSON.parse(plaintext);
    }
    else if (connection.secrets) {
      decryptedSecrets = connection.secrets;
    }

    // get access keys and secrets
    const { consumer_secret, access_token, access_secret } = decryptedSecrets;
    const { consumer_key } = connection.config_public;

    const url = "https://api.twitter.com/1.1/statuses/update.json";
    const params = { status: content };

    // generate the header
    const authHeader = generateOAuth1Header({
      method: "POST",
      url,
      params,
      consumerKey: consumer_key,
      consumerSecret: consumer_secret,
      accessToken: access_token,
      accessSecret: access_secret,
    });

    // Post to Twitter
    const body = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const result = await response.json();
    if (!response.ok) {
      return jsonResponse({ error: result }, req, response.status);
    }

    return jsonResponse({ success: true, data: result }, req, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message }, req, 500);
  }
});
