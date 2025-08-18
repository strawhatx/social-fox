// Setup type definitions for built-in Supabase Runtime APIs
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14.21.0";
import { createErrorResponse, createSuccessResponse, getUserByEmail, addCreditsToUser, addAdditionalCreditsToUser, revokeUserAccess, PRICE_ID_TO_CREDITS, PRICE_ID_TO_ADDITIONAL_CREDITS } from "./helper/util.ts";
import { supabase } from "../utils/supabase.ts";
import { validateStripeSignature } from "../utils/auth.ts";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

// Main handler
serve(async (req) => {
    if (req.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const body = await req.text();

        // Validate Stripe signature
        if (!validateStripeSignature(req)) {
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
                    await handleCheckoutSessionCompleted(stripe, data);
                    break;
                }
                case 'customer.subscription.deleted': {
                    await handleCustomerSubscriptionDeleted(stripe, data);
                    break;
                }
                case 'invoice.payment_succeeded': {
                    await handleInvoicePaymentSucceeded(stripe, data);
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
