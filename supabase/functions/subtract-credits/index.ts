// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { supabase } from "../utils/supabase.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { validateSupabaseToken } from "../utils/auth.ts";

type JsonRecord = Record<string, unknown>;

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

serve(async (req) => {
  const rl = await applyRateLimit(req, "subtract-credits");
  if (rl) return rl;

  const cors = handleCORS(req);
  if (cors) return cors;

  if (!validateEdgeFunctionsKey(req)) {
    return new Response("Unauthorized - Edge Functions Key", { status: 401 });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, req, 405);
  }

  try {
    let amount = 1;
    let description = "Usage";
    try {
      const body = (await req.json()) as JsonRecord;
      if (typeof body.amount === "number" && Number.isFinite(body.amount)) {
        amount = Math.max(1, Math.floor(body.amount));
      }
      if (typeof body.description === "string" && body.description.trim().length > 0) {
        description = body.description.trim();
      }
    } catch {
      // ignore body parse errors, use defaults
    }

    // 1) Fetch current credits
    const { data: creditsRow, error: fetchErr } = await supabase
      .from("user_credits")
      .select("credits, additional_credits")
      .eq("user_id", authedUser.id)
      .single();

    if (fetchErr) {
      console.error("subtract-credits fetch error", fetchErr);
      return jsonResponse({ error: "Failed to fetch credits" }, req, 500);
    }

    const currentCredits = (creditsRow?.credits as number) || 0;
    const currentAdditional = (creditsRow?.additional_credits as number) || 0;

    // 2) Compute new balances (consume normal credits first, then additional)
    let remaining = amount;
    const consumeFromCredits = Math.min(currentCredits, remaining);
    const newCredits = currentCredits - consumeFromCredits;
    remaining -= consumeFromCredits;

    const consumeFromAdditional = Math.min(currentAdditional, remaining);
    const newAdditional = currentAdditional - consumeFromAdditional;
    remaining -= consumeFromAdditional;

    if (remaining > 0) {
      return jsonResponse({ error: "Insufficient credits" }, req, 400);
    }

    // 3) Update atomically with optimistic concurrency guard
    const { data: updated, error: updateErr } = await supabase
      .from("user_credits")
      .update({ credits: newCredits, additional_credits: newAdditional })
      .eq("user_id", authedUser.id)
      .eq("credits", currentCredits)
      .eq("additional_credits", currentAdditional)
      .select("credits, additional_credits");

    if (updateErr) {
      console.error("subtract-credits update error", updateErr);
      return jsonResponse({ error: "Failed to update credits" }, req, 500);
    }

    if (!updated || updated.length === 0) {
      // Concurrency conflict
      return jsonResponse({ error: "Conflict, please retry" }, req, 409);
    }

    // 4) Log transaction as negative amount
    const { error: logErr } = await supabase.from("credit_transactions").insert({
      user_id: authedUser.id,
      amount: -amount,
      transaction_type: "usage",
      description,
    });

    if (logErr) {
      console.error("subtract-credits log error", logErr);
      // Non-fatal; proceed
    }

    return jsonResponse(
      {
        success: true,
        balances: {
          credits: updated[0].credits,
          additional_credits: updated[0].additional_credits,
          total_credits: updated[0].credits + updated[0].additional_credits,
        },
      },
      req,
      200,
    );
  } catch (e) {
    console.error("subtract-credits error", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, req, 500);
  }
});


