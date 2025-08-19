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
    // Get authenticated user
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user?.email) {
      throw new Error('User not authenticated');
    }

    const { product_type } = await req.json();
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id }
      });
      
      customerId = customer.id;
      
      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    let session;
    const origin = req.headers.get('origin') || 'http://localhost:5173';

    if (product_type === 'pro_subscription') {
      // Pro subscription - $9/month for 50 credits
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Pro Plan - 50 Credits Monthly' },
            unit_amount: 900, // $9
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${origin}/settings?success=subscription`,
        cancel_url: `${origin}/settings`,
        metadata: {
          user_id: user.id,
          product_type: 'pro_subscription'
        }
      });
    } else if (product_type === 'free_subscription') {
      // Free subscription - $0/month for 10 credits
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'Free Plan - 10 Credits Monthly' },
            unit_amount: 0, // $0
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        mode: 'subscription',
        success_url: `${origin}/settings?success=subscription`,
        cancel_url: `${origin}/settings`,
        metadata: {
          user_id: user.id,
          product_type: 'free_subscription'
        }
      });
    } else if (product_type === 'additional_credits') {
      // Additional credits - $5 for 50 credits (one-time)
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: '50 Additional Credits' },
            unit_amount: 500 // $5
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${origin}/settings?success=credits`,
        cancel_url: `${origin}/settings`,
        metadata: {
          user_id: user.id,
          product_type: 'additional_credits'
        }
      });
    } else {
      throw new Error('Invalid product type');
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});