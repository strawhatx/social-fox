// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { supabase } from "../utils/supabase.ts";
import { handleCORS, handleReturnCORS } from "../utils/cors.ts";
import { applyRateLimit } from "../utils/rate-limiter.ts";
import { validateSupabaseToken } from "../utils/auth.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const FREE_PRICE_ID = 'price_1RxAuj4cECBWesjx3nqOMQru';

type JsonRecord = Record<string, unknown>;

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

serve(async (req) => {
  // Rate limit and CORS
  const rl = await applyRateLimit(req, "create-free-subscription");
  if (rl) return rl;

  const cors = handleCORS(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, req, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const authedUser = await validateSupabaseToken(authHeader);

    // Resolve price ID from env or optional payload override
    const priceId = FREE_PRICE_ID;

    // Fetch profile to get email and existing stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, stripe_customer_id, stripe_subscription_id")
      .eq("id", authedUser.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Profile not found" }, req, 404);
    }

    // Ensure Stripe customer exists
    let stripeCustomerId = profile.stripe_customer_id as string | null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: (profile as any).email || undefined,
        metadata: { user_id: profile.id },
      });
      stripeCustomerId = customer.id;

      // Persist customer id
      const { error: updateCustomerErr } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.id);
      if (updateCustomerErr) {
        console.error("Failed to save stripe_customer_id:", updateCustomerErr);
      }
    }

    // Create a free subscription if none exists or if explicitly requested
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId!,
      items: [{ price: priceId }],
      payment_behavior: "allow_incomplete",
      metadata: { user_id: profile.id, plan: "free" },
      expand: ["latest_invoice"],
    });

    // Do not mutate profile here; rely on Stripe webhooks to update subscription fields
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    return jsonResponse(
      {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price?.id || priceId,
          current_period_end: currentPeriodEnd,
        },
      },
      req,
      200,
    );
  } catch (e) {
    console.error("create-free-subscription error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      req,
      500,
    );
  }
});


