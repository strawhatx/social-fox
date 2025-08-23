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

const FREE_PRICE_ID = Deno.env.get("STRIPE_FREE_PRICE_ID") || 'price_1RxAuj4cECBWesjx3nqOMQru';

type JsonRecord = Record<string, unknown>;

const jsonResponse = (data: unknown, req: Request, status = 200) =>
  new Response(JSON.stringify(data), { headers: handleReturnCORS(req), status });

type ProfileRecord = {
  id: string;
  email?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

const ACTIVE_LIKE_STATUSES = ["trialing", "active", "past_due", "unpaid", "paused"] as const;

async function persistStripeCustomerId(profileId: string, customerId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", profileId);
  if (error) {
    console.error("Failed to save stripe_customer_id:", error);
  }
}

async function resolveStripeCustomerId(profile: ProfileRecord): Promise<string> {
  if (profile.stripe_customer_id) return profile.stripe_customer_id;

  const profileEmail = profile.email || undefined;

  // Try to find an existing customer by email first to avoid duplicates
  let resolvedCustomerId: string | null = null;
  if (profileEmail) {
    try {
      const searchResult = await stripe.customers.search({
        query: `email:'${profileEmail}' AND -deleted:'true'`,
        limit: 1,
      });
      const found = searchResult.data[0];
      if (found) {
        if (!found.metadata?.user_id || found.metadata.user_id === profile.id) {
          resolvedCustomerId = found.id;
          if (!found.metadata?.user_id) {
            await stripe.customers.update(found.id, { metadata: { user_id: profile.id } });
          }
        }
      }
    } catch (err) {
      console.warn("Stripe customer search failed, creating new customer:", err);
    }
  }

  if (!resolvedCustomerId) {
    const customer = await stripe.customers.create({
      email: profileEmail,
      metadata: { user_id: profile.id },
    });
    resolvedCustomerId = customer.id;
  }

  await persistStripeCustomerId(profile.id, resolvedCustomerId);
  return resolvedCustomerId;
}

async function findExistingActiveLikeSubscription(customerId: string) {
  const existingSubs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
    expand: ["data.latest_invoice"],
  });
  return existingSubs.data.find((s) => ACTIVE_LIKE_STATUSES.includes(s.status as typeof ACTIVE_LIKE_STATUSES[number]));
}

function buildSubscriptionPayload(subscription: Stripe.Subscription, priceId: string) {
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  return {
    id: subscription.id,
    status: subscription.status,
    price_id: subscription.items.data[0]?.price?.id || priceId,
    current_period_end: currentPeriodEnd,
  } as const;
}


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

    // Ensure Stripe customer exists (search by email, or create, then persist)
    const stripeCustomerId = await resolveStripeCustomerId(profile as ProfileRecord);

    // Check for an existing active-like subscription for this customer
    const existingActive = await findExistingActiveLikeSubscription(stripeCustomerId);
    if (existingActive) {
      return jsonResponse(
        {
          success: true,
          subscription: buildSubscriptionPayload(existingActive, priceId),
        },
        req,
        200,
      );
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
    return jsonResponse(
      { success: true, subscription: buildSubscriptionPayload(subscription, priceId) },
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


