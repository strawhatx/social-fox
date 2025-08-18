// Setup type definitions for built-in Supabase Runtime APIs
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";
import { supabase } from "../utils/supabase.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const createErrorResponse = (message: string, status = 400) => {
    return new Response(
        JSON.stringify({ error: message }),
        {
            headers: { "Content-Type": "application/json" },
            status
        }
    );
};

const createSuccessResponse = (data: unknown = {}) => {
    return new Response(
        JSON.stringify(data),
        {
            headers: { "Content-Type": "application/json" },
            status: 200
        }
    );
};

// Helper function to get user by email
async function getUserByEmail(email: string) {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .limit(1);

    if (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }

    return profiles?.[0] || null;
}

// Helper function to create user profile if not exists
async function createUserProfile(email: string, name?: string) {
    // First create auth user (this might need to be handled differently depending on your auth setup)
    // For now, we'll assume the user exists in auth.users but not in profiles

    const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
            email,
            full_name: name || null,
        })
        .select('id, email, full_name')
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }

    return profile;
}

// Helper function to add credits to user account
async function addCreditsToUser(userId: string, amount: number, description: string, stripeSessionId?: string) {
    const { data, error } = await supabase.rpc('update_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: 'purchase',
        p_description: description,
        p_stripe_session_id: stripeSessionId
    });

    if (error) {
        console.error('Error updating user credits:', error);
        return false;
    }

    return data;
}

async function addAdditionalCreditsToUser(userId: string, amount: number, description: string, stripeSessionId?: string) {
    const { data, error } = await supabase.rpc('update_user_additional_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: 'purchase',
        p_description: description,
        p_stripe_session_id: stripeSessionId
    });

    if (error) {
        console.error('Error updating user additional credits:', error);
        return false;
    }

    return data;
}

// Helper function to revoke access (set credits to 0 for subscription cancellation)
async function revokeUserAccess(userId: string, description: string) {
    // First, get current credits to know how much to subtract
    const { data: userCredits, error: creditError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .single();

    if (creditError || !userCredits) {
        console.error('Error fetching user credits:', creditError);
        return false;
    }

    const { data, error } = await supabase.rpc('update_user_credits', {
        p_user_id: userId,
        p_amount: 0, // just set to zero
        p_transaction_type: 'revocation',
        p_description: description
    });

    if (error) {
        console.error('Error revoking user access:', error);
        return false;
    }

    return data;
}

// Credit amounts based on price IDs - you'll need to configure these based on your Stripe products
const PRICE_ID_TO_CREDITS: Record<string, number> = {
    // Example price IDs - replace with your actual Stripe price IDs
    'price_1RxAuj4cECBWesjx3nqOMQru': 10,     // $0 for 10 credits - free plan
    'price_1RxAwM4cECBWesjxNKynZfd6': 50,         // $9 for 50 credits - pro plan
};

const PRICE_ID_TO_ADDITIONAL_CREDITS: Record<string, number> = {
    'price_1RxAzr4cECBWesjxO80H6LMu': 50,         // $5 more for 50 credits - additional credits
};

// Main handler
serve(async (req) => {
    if (req.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            return createErrorResponse('Missing stripe-signature header', 400);
        }

        let event: Stripe.Event;

        // Verify Stripe event is legitimate
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error(`Webhook signature verification failed. ${err.message}`);
            return createErrorResponse(`Webhook signature verification failed: ${err.message}`, 400);
        }

        const data = event.data;
        const eventType = event.type;

        console.log(`Processing Stripe webhook event: ${eventType}`);

        try {
            switch (eventType) {
                case 'checkout.session.completed': {
                    // First payment is successful and a subscription is created
                    const session = await stripe.checkout.sessions.retrieve(
                        data.object.id,
                        {
                            expand: ['line_items', 'customer']
                        }
                    );

                    const customerId = session?.customer as string;
                    const customer = await stripe.customers.retrieve(customerId);
                    const priceId = session?.line_items?.data[0]?.price?.id;

                    if (!customer || customer.deleted) {
                        throw new Error('Customer not found or deleted');
                    }

                    if (!customer.email) {
                        throw new Error('Customer email not found');
                    }

                    // Find or create user
                    let user = await getUserByEmail(customer.email);

                    if (!user) {
                        user = await createUserProfile(customer.email, customer.name || undefined);
                        if (!user) {
                            throw new Error('Failed to create user profile');
                        }
                    }

                    // Determine credits to add based on price ID
                    const creditsToAdd = priceId ? PRICE_ID_TO_CREDITS[priceId] : 0;

                    if (creditsToAdd > 0) {
                        const success = await addCreditsToUser(
                            user.id,
                            creditsToAdd,
                            `Credits purchased - ${creditsToAdd} credits`,
                            session.id
                        );

                        if (!success) {
                            throw new Error('Failed to add credits to user account');
                        }

                        console.log(`Successfully added ${creditsToAdd} credits to user ${user.email}`);
                    } else {
                        console.log(`No credits configured for price ID: ${priceId}`);
                    }

                    break;
                }

                case 'customer.subscription.deleted': {
                    // Subscription cancelled - revoke access
                    const subscription = await stripe.subscriptions.retrieve(data.object.id);
                    const customer = await stripe.customers.retrieve(subscription.customer as string);

                    if (!customer || customer.deleted || !customer.email) {
                        throw new Error('Customer not found or has no email');
                    }

                    const user = await getUserByEmail(customer.email);

                    if (user) {
                        const success = await revokeUserAccess(
                            user.id,
                            'Subscription cancelled - access revoked'
                        );

                        if (!success) {
                            throw new Error('Failed to revoke user access');
                        }

                        console.log(`Successfully revoked access for user ${user.email}`);
                    } else {
                        console.log(`User not found for email: ${customer.email}`);
                    }

                    break;
                }

                case 'invoice.payment_succeeded': {
                    // Payment succeeded - add credits to user account
                    const invoice = await stripe.invoices.retrieve(data.object.id);
                    const customer = await stripe.customers.retrieve(invoice.customer as string);
                    const priceId = invoice.lines.data[0]?.price?.id;

                    if (priceId && PRICE_ID_TO_ADDITIONAL_CREDITS[priceId]) {
                        const additionalCredits = PRICE_ID_TO_ADDITIONAL_CREDITS[priceId];

                        // TODO: add additional credits to user account
                        const success = await addAdditionalCreditsToUser(customer.id, additionalCredits, `Additional credits purchased - ${additionalCredits} credits`, invoice.id);
                    }
                    else {
                        // TODO: add credits to user account
                        const creditsToAdd = priceId ? PRICE_ID_TO_CREDITS[priceId] : 0;

                        const success = await addCreditsToUser(customer.id, creditsToAdd, `Credits purchased - ${creditsToAdd} credits`, invoice.id);
                        console.log(`No additional credits configured for price ID: ${priceId}`);
                    }

                    break;
                }

                case 'invoice.payment_failed': {
                    // Payment failed - could suspend access if needed
                    console.log('Invoice payment failed - no action taken');
                    break;
                }

                default:
                    console.log(`Unhandled event type: ${eventType}`);
            }
        } catch (e) {
            console.error(`Stripe webhook processing error: ${e.message} | EVENT TYPE: ${eventType}`);

            // Return error response so Stripe will retry
            return createErrorResponse(`Processing error: ${e.message}`, 500);
        }

        return createSuccessResponse({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
});
