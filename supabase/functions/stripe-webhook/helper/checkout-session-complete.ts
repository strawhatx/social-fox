import Stripe from "npm:stripe@14.21.0";
import {
    getUserByEmail,
    addCreditsToUser,
    createUserProfile,
    PRICE_ID_TO_CREDITS,
    PRICE_ID_TO_ADDITIONAL_CREDITS,
    addAdditionalCreditsToUser,
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

    // Only handle one-time payments here; skip subscriptions to avoid duplicate crediting
    if (session.mode === 'subscription') {
        console.log('Skipping checkout.session.completed for subscription mode');
        return;
    }

    // Idempotency: skip if we've already recorded this session/invoice
    const invoiceId = typeof session.invoice === "string"
        ? session.invoice
        : session.invoice?.id;
    const alreadyProcessed = await hasProcessedStripeId(invoiceId || session.id);
    if (alreadyProcessed) {
        console.log(`Idempotency hit for checkout session/invoice ${invoiceId || session.id}`);
        return;
    }

    // --- Handle customer safely (string ID or expanded object) ---
    let customerId: string;
    let customer: Stripe.Customer;

    if (typeof session.customer === "string") {
        customerId = session.customer;
        customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    } 
    else if (session.customer && !("deleted" in session.customer)) {
        customerId = session.customer.id;
        customer = session.customer as Stripe.Customer;
    } else {
        throw new Error("Customer not found or deleted");
    }

    if (!customer.email) {
        throw new Error("Customer email not found");
    }

    // --- Get price ID from first line item ---
    const priceId = session.line_items?.data[0]?.price?.id;

    // invoiceId already computed above

    // --- Find or create local user ---
    let user = await getUserByEmail(customer.email);
    if (!user) {
        user = await createUserProfile(customer.email, customer.name || undefined);
        if (!user) throw new Error("Failed to create user profile");
    }

    // --- Handle credit logic ---
    if (priceId && PRICE_ID_TO_ADDITIONAL_CREDITS[priceId]) {
        const additionalCredits = PRICE_ID_TO_ADDITIONAL_CREDITS[priceId] || 0;

        const success = await addAdditionalCreditsToUser(
            customerId,
            additionalCredits,
            `Additional credits purchased - ${additionalCredits} credits`,
            invoiceId
        );

        if (!success) throw new Error("Failed to add additional credits");
        console.log(`✅ Added ${additionalCredits} additional credits to ${user.email}`);
    }
    else {
        console.log(`⚠️ No credits configured for price ID: ${priceId}`);
    }
};
