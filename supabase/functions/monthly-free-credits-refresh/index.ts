import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { supabase } from "../utils/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Fetch all profiles (id, stripe_customer_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, stripe_customer_id');

    if (profilesError) throw profilesError;

    let processed = 0;
    let toppedUp = 0;
    let skippedSubscribed = 0;

    for (const profile of profiles || []) {
      processed++;

      // Determine if the user has an active subscription
      let hasActiveSubscription = false;
      if (profile.stripe_customer_id) {
        try {
          const subs = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1,
          });
          hasActiveSubscription = subs.data.length > 0;
        } catch (e) {
          console.error(`Stripe error for customer ${profile.stripe_customer_id}:`, e.message);
        }
      }

      if (hasActiveSubscription) {
        skippedSubscribed++;
        continue; // Pro users handled by Stripe webhooks
      }

      // Free users: ensure minimum 10 credits each month (top-up to 10; don't remove extras)
      const { data: creditRow, error: creditError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (creditError) {
        console.error(`Error fetching credits for user ${profile.id}:`, creditError.message);
        continue;
      }

      const current = creditRow?.credits ?? 0;
      const target = 10;
      const diff = Math.max(0, target - current);

      if (diff > 0) {
        const { error: rpcError } = await supabase.rpc('update_user_credits', {
          p_user_id: profile.id,
          p_amount: diff,
          p_transaction_type: 'bonus',
          p_description: 'Monthly free plan refresh',
          p_stripe_session_id: null
        });

        if (rpcError) {
          console.error(`Failed to top-up user ${profile.id}:`, rpcError.message);
        } else {
          toppedUp++;
        }
      }
    }

    return new Response(JSON.stringify({ processed, toppedUp, skippedSubscribed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('monthly-free-credits-refresh error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
