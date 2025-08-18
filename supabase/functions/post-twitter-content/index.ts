// File: functions/post-twitter/edge.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import CryptoJS from "https://esm.sh/crypto-js@4.2.0";
import { supabase } from "../utils/supabase.ts";
import { getMasterKey } from "../utils/vault.ts";
import { decrypt } from "../utils/encryption.ts";
import { validateEdgeFunctionsKey } from "../utils/auth.ts";

// Helper: generate OAuth1 header following Twitter's exact requirements
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
  // Generate a cryptographically secure nonce
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const oauth: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  // Merge all parameters for signature base - this is critical for Twitter API
  const allParams = { ...params, ...oauth };
  
  // Sort parameters alphabetically by key (critical for Twitter)
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map(key => {
      // Use RFC 3986 encoding (Twitter is strict about this)
      const encodedKey = percentEncode(key);
      const encodedValue = percentEncode(allParams[key]);
      return `${encodedKey}=${encodedValue}`;
    })
    .join("&");

  // Construct the signature base string exactly as Twitter expects
  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");

  // Construct the signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessSecret)}`;

  // Debug logging (without exposing secrets)
  console.log('OAuth1 signature generation:', {
    method: method.toUpperCase(),
    url,
    paramCount: Object.keys(allParams).length,
    sortedParamKeys: sortedKeys,
    paramStringLength: paramString.length,
    baseStringLength: baseString.length,
    signingKeyLength: signingKey.length,
    nonceLength: nonce.length,
    timestamp: oauth.oauth_timestamp,
    signatureMethod: oauth.oauth_signature_method,
    oauthVersion: oauth.oauth_version,
    // Show first few chars of sensitive values for debugging (not full values)
    consumerKeyPrefix: consumerKey.substring(0, 8) + '...',
    accessTokenPrefix: accessToken.substring(0, 8) + '...',
    // Show the parameter structure for debugging
    oauthParamsOnly: Object.keys(oauth),
    bodyParamsOnly: Object.keys(params),
    // Check if timestamp is reasonable (within last few minutes)
    timestampAge: Math.floor(Date.now() / 1000) - parseInt(oauth.oauth_timestamp)
  });

  // Generate signature using HMAC-SHA1
  const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);
  oauth.oauth_signature = signature;

  // Build Authorization header - only include OAuth parameters, not body parameters
  const authHeader = "OAuth " + Object.entries(oauth)
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(", ");

  return authHeader;
}

// RFC 3986 percent encoding function (Twitter requires this exact encoding)
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

// Edge function
serve(async (req) => {
  const rateLimitResponse = await applyRateLimit(req, 'post-twitter-content');
  if (rateLimitResponse) return rateLimitResponse;

  const cors = handleCORS(req);
  if (cors) return cors;

  if (!validateEdgeFunctionsKey(req)) {
    return new Response("Unauthorized - Edge Functions Key", { status: 401 });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, req, 405);
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
    const { consumer_secret, access_token, access_secret } = decryptedSecrets || {};
    const { consumer_key } = connection.config_public || {};

    // Debug: log what we have (without exposing secrets)
    console.log('Debugging auth values:', {
      hasConsumerKey: !!consumer_key,
      hasConsumerSecret: !!consumer_secret,
      hasAccessToken: !!access_token,
      hasAccessSecret: !!access_secret,
      decryptedSecretsKeys: decryptedSecrets ? Object.keys(decryptedSecrets) : 'null',
      configPublicKeys: connection.config_public ? Object.keys(connection.config_public) : 'null',
      // Log the actual connection structure (without secrets)
      connectionId: connection.id,
      connectionStatus: connection.status,
      connectionProvider: connection.config_public?.provider,
      secretsStructure: connection.secrets ? Object.keys(connection.secrets) : 'null'
    });

    if (!consumer_key || !consumer_secret || !access_token || !access_secret) {
      return jsonResponse({ 
        error: "Missing required OAuth credentials",
        debug: {
          hasConsumerKey: !!consumer_key,
          hasConsumerSecret: !!consumer_secret,
          hasAccessToken: !!access_token,
          hasAccessSecret: !!access_secret
        }
      }, req, 400);
    }

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

    // Debug: log the generated auth header structure (without sensitive values)
    console.log('Generated OAuth1 header preview:', {
      hasAuthHeader: !!authHeader,
      headerLength: authHeader?.length,
      startsWithOAuth: authHeader?.startsWith('OAuth '),
      headerStructure: authHeader?.split(', ').map(part => part.split('=')[0]),
      // Check if auth header contains all required OAuth parameters
      containsConsumerKey: authHeader?.includes('oauth_consumer_key'),
      containsNonce: authHeader?.includes('oauth_nonce'),
      containsSignature: authHeader?.includes('oauth_signature'),
      containsSignatureMethod: authHeader?.includes('oauth_signature_method'),
      containsTimestamp: authHeader?.includes('oauth_timestamp'),
      containsToken: authHeader?.includes('oauth_token'),
      containsVersion: authHeader?.includes('oauth_version')
    });

    // Post to Twitter
    const body = new URLSearchParams(params).toString();
    console.log('Request details:', {
      url,
      method: 'POST',
      bodyParams: Object.keys(params),
      contentType: 'application/x-www-form-urlencoded'
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const result = await response.json();
    console.log('Twitter API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      result
    });
    
    if (!response.ok) {
      return jsonResponse({ 
        error: result,
        debug: {
          status: response.status,
          statusText: response.statusText
        }
      }, req, response.status);
    }

    return jsonResponse({ success: true, data: result }, req, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message }, req, 500);
  }
});
