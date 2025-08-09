// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { decrypt } from "../utils/encryption.ts";
import { getMasterKey } from "../utils/vault.ts";

interface RequestBody {
  project_id?: string;
  provider?: string;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

function isAuthorized(req: Request): boolean {
  const header = req.headers.get("Authorization");
  const expected = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`;
  return !!header && header === expected;
}

serve(async (req) => {
  const rateLimitResponse = await applyRateLimit(req, 'get-connection-secrets');
  if (rateLimitResponse) return rateLimitResponse;

  const cors = handleCORS(req);
  if (cors) return cors;

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (!isAuthorized(req)) {
    return jsonResponse({ error: 'Forbidden' }, req, 403);
  }

  try {
    const body = (await req.json()) as RequestBody;
    const {project_id, provider } = body;

    if (!project_id || !provider) {
      return jsonResponse({ error: 'Provide project_id and provider' }, req, 400);
    }

    // Fetch integration id for provider
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', provider)
      .single();

    if (integrationError || !integration) {
      return jsonResponse({ error: `Integration not found for provider: ${provider}` }, req, 404);
    }

    // Fetch connection by project and integration
    const { data: connection, error } = await supabase
      .from('connections')
      .select('id, integration_id, secrets, config_public, project_id')
      .eq('project_id', project_id)
      .eq('integration_id', integration.id)
      .single();

    if (error) throw error;

    if (!connection) {
      return jsonResponse({ error: 'Connection not found' }, req, 404);
    }

    const masterKey = getMasterKey();
    let decryptedSecrets: Record<string, unknown> | null = null;

    if (connection.secrets && connection.secrets.encrypted) {
      const plaintext = await decrypt(connection.secrets.encrypted, masterKey);
      decryptedSecrets = JSON.parse(plaintext);
    } 
    else if (connection.secrets) {
      decryptedSecrets = connection.secrets;
    }

    return jsonResponse({
      connection_id: connection.id,
      integration_id: connection.integration_id,
      project_id: connection.project_id,
      secrets: decryptedSecrets,
      access_token_expires_at: connection.config_public?.access_token_expires_at ?? null,
      refresh_token_expires_at: connection.config_public?.refresh_token_expires_at ?? null
    }, req);
  } 
  catch (e) {
    console.error('get-connection-secrets error:', e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, req, 500);
  }
}); 