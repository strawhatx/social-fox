// Setup type definitions for built-in Supabase Runtime APIs
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { clearOAuthState, getOAuthData } from "../utils/state.ts";
import { encrypt } from "../utils/encryption.ts";
import { getMasterKey } from "../utils/vault.ts";
import { OAuthCallbackStrategyFactory } from "./strategy/index.ts";

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

// Main handler
serve(async (req) => {
  // Apply rate limiting first
  const rateLimitResponse = await applyRateLimit(req, 'oauth-callback');
  if (rateLimitResponse) return rateLimitResponse;

  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json()
    const provider = body.provider;
    const message = await OAuthCallbackStrategyFactory.getStrategy(provider).handleRequest(req, body);

    return createSuccessResponse(message, req);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred', req);
  }
});