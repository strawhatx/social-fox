// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { ProcessOauthStrategyFactory } from "./strategy/index.ts";


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
    const { provider } = await req.json() as { provider: string };
    const oauthUrl = await ProcessOauthStrategyFactory.getStrategy(provider).handleRequest(req);
    
    return new Response(JSON.stringify({ oauth_url: oauthUrl }), { headers: handleReturnCORS(req), status: 200 });
  } catch (error) {
    console.error('Process OAuth error:', error);
    return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred', req);
  }
});

