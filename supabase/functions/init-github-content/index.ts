// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { supabase } from "../utils/supabase.ts";

interface RequestBody {
  project_id?: string;
  connection_id?: string;
  provider?: string; // optional; used only as a fallback when connection_id is not provided
}

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

serve(async (req) => {
  // Rate limit first
  const rateLimited = await applyRateLimit(req, "init-github-content");
  if (rateLimited) return rateLimited;

  // CORS preflight
  const cors = handleCORS(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Validate user JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing or invalid authorization header" }, req, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Invalid or expired token" }, req, 401);
    }

    const { project_id, connection_id } = (await req.json()) as RequestBody;

    if (!project_id || !connection_id) {
      return jsonResponse({ error: "Missing project_id or connection_id" }, req, 400);
    }

    // Find connection by project and integration
    const { data: connection, error: connectionError } = await supabase
      .from("connections")
      .select("id, project_id, integration_id, config_public")
      .eq("id", connection_id)
      .single();

    if (connectionError || !connection) {
      return jsonResponse({ error: "Connection not found" }, req, 404);
    }

    // Ensure repository is configured before init
    const repository = connection.config_public?.repository as
      | { owner?: string; repository?: string; owner_url?: string; repository_url?: string }
      | undefined;
    if (!repository?.owner || !repository?.repository) {
      return jsonResponse({ error: "Repository not configured on connection" }, req, 400);
    }

    // Server-side credit check: require minimum credits before allowing init
    const REQUIRED_CREDITS_FOR_INIT = 3;

    // Use authenticated user from Authorization header
    const userId = user.id;

    // Fetch user credits using authenticated user id
    const { data: creditsRow, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits, additional_credits")
      .eq("user_id", userId)
      .single();

    if (creditsError) {
      return jsonResponse({ error: "Failed to fetch credits" }, req, 500);
    }

    const baseCredits = (creditsRow?.credits as number) ?? 0;
    const bonusCredits = (creditsRow?.additional_credits as number) ?? 0;
    const totalCredits = baseCredits + bonusCredits;

    if (totalCredits < REQUIRED_CREDITS_FOR_INIT) {
      return jsonResponse({ error: "Insufficient credits", required: REQUIRED_CREDITS_FOR_INIT, total: totalCredits }, req, 402);
    }

    // Ensure we only initialize once
    const { initialized_at } = connection.config_public as { initialized_at?: string };
    if (initialized_at) {
      return jsonResponse({ status: "already_initialized" }, req, 200);
    }

    // Mark as initialized first to prevent races
    const { error: connectionUpdateError } = await supabase
      .from("connections")
      .update({
        config_public: {
          ...connection.config_public,
          initialized_at: new Date().toISOString(),
        },
      })
      .eq("id", connection.id);

    if (connectionUpdateError) {
      return jsonResponse({ error: "Failed to mark initialized" }, req, 500);
    }

    // Initialize last_fetched_at to 14 days ago so first sync pulls a week of history
    const fourteenDaysAgoIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({ last_fetched_at: fourteenDaysAgoIso })
      .eq("id", project_id);

    if (projectUpdateError) {
      return jsonResponse({ error: "Failed to update project" }, req, 500);
    }

    // Optional webhook: call after all work is done with Basic Auth (n8n)
    let webhookStatus: "sent" | "skipped" | "failed" = "skipped";
    const webhookUrl = `${Deno.env.get("8N8_WEBHOOK_BASE_URL")}/intitalize`;

    const N8NUSER = Deno.env.get("8N8_USERNAME");
    const N8NPASSWORD = Deno.env.get("N8N_PASSWORD");

    try {
      const basicAuth = N8NUSER && N8NPASSWORD ? `Basic ${btoa(`${N8NUSER}:${N8NPASSWORD}`)}` : undefined;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(basicAuth ? { Authorization: basicAuth } : {}),
        },
        body: JSON.stringify({
          event: "init_github_content",
          project_id,

        }),
      });

      console.log('res', res);

      webhookStatus = res.ok ? "sent" : "failed";
    } catch (_e) {
      webhookStatus = "failed";
      console.error('Webhook failed:', _e);
      throw _e;
    }

    return jsonResponse({ status: "initialized", webhook: webhookStatus }, req, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return jsonResponse({ error: message }, req, 500);
  }
});


