import Stripe from "npm:stripe@14.21.0";
import {
    getUserIdFromCustomer,
    getCreditsForProductType,
    addCreditsToUser,
    hasProcessedStripeId
} from "./util.ts";

export const handleCheckoutSessionCompleted = async (
    stripe: Stripe,
    data: Stripe.Event.Data
) => {
    // Retrieve the full session with expansions
    const session = await stripe.checkout.sessions.retrieve(
        data.object.id,
        { expand: ["line_items", "customer", "invoice"] }
    );

    // Idempotency check
    const alreadyProcessed = await hasProcessedStripeId(session.id);
    if (alreadyProcessed) {
        console.log(`Idempotency hit for checkout session ${session.id}`);
        return;
    }

    // Get customer ID
    const customerId = typeof session.customer === "string" 
        ? session.customer 
        : session.customer?.id;
    
    if (!customerId) {
        throw new Error("No customer ID found in session");
    }

    // Get user ID from customer metadata
    const userId = await getUserIdFromCustomer(stripe, customerId);
    if (!userId) {
        throw new Error("No user ID found in customer metadata");
    }

    // Get product type from session metadata
    const productType = session.metadata?.product_type;
    if (!productType) {
        console.log("No product type found in session metadata");
        return;
    }

    // Handle different product types
    if (session.mode === 'payment' && productType === 'additional_credits') {
        // One-time credit purchase
        const credits = getCreditsForProductType(productType);
        const success = await addCreditsToUser(
            userId,
            credits,
            `Additional credits purchased - ${credits} credits`,
            session.id
        );

        if (!success) throw new Error("Failed to add additional credits");
        console.log(`✅ Added ${credits} additional credits to user ${userId}`);
    } else if (session.mode === 'subscription' && productType === 'pro_subscription') {
        // Pro subscription - credits will be handled by invoice.payment_succeeded
        console.log(`✅ Pro subscription created for user ${userId}`);
    } else {
        console.log(`⚠️ Unhandled product type: ${productType} with mode: ${session.mode}`);
    }
};
