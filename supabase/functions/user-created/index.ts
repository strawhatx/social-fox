import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { supabase } from "../utils/supabase.ts";
import { validateInternalApiKey } from "../utils/auth.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
});

interface UserCreatedPayload {
    type: string;
    table: string;
    record: {
        id: string;
        email: string;
        raw_user_meta_data?: {
            full_name?: string;
        };
    };
    schema: string;
    old_record: null;
}

Deno.serve(async (req) => {
    try {
        // Validate hook secret
        if (!validateInternalApiKey(req))
            return new Response("Unauthorized - Internal API Key", { status: 401 });

        const { event, user } = await req.json();

        // Only handle user_signed_up events
        if (event !== "user_signed_up")
            return new Response("Not a user creation event", { status: 200 });

        console.log(`Creating Stripe customer for user ${user.email} with free plan`);

        // Create customer in Stripe
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.raw_user_meta_data?.full_name,
            metadata: {
                supabase_uid: user.id,
            },
        });

        // Save customer ID in Supabase profiles table
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ stripe_customer_id: customer.id })
            .eq("id", user.id);

        if (profileError) {
            console.error("Error updating profile with customer ID:", profileError);
            throw profileError;
        }

        // Create Free subscription (no payment required)
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: Deno.env.get("STRIPE_FREE_SUBSCRIPTION_PRICE_ID")!,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${Deno.env.get("FRONTEND_URL")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${Deno.env.get("FRONTEND_URL")}/dashboard`,
            metadata: {
                user_id: user.id,
            },
        });

        console.log(`Successfully created Stripe customer ${customer.id} and free subscription for user ${user.email}`);

        return new Response(JSON.stringify({
            success: true,
            customer_id: customer.id
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Error in user-created function:", err);
        return new Response(JSON.stringify({
            error: "Error creating Stripe customer and subscription",
            details: err.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
