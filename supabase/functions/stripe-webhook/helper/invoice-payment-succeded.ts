import Stripe from "npm:stripe@14.21.0";
import { getUserIdFromCustomer, getCreditsForProductType, addCreditsToUser, hasProcessedStripeId } from "./util.ts";

export const handleInvoicePaymentSucceeded = async (stripe: Stripe, data: Stripe.Event.Data) => {
    // Payment succeeded - add credits to user account
    const invoice = await stripe.invoices.retrieve(data.object.id);

    // Only process subscription invoices here; skip one-off invoices
    if (!invoice.subscription) {
        console.log('Skipping invoice.payment_succeeded for non-subscription invoice');
        return;
    }

    // Idempotency: skip if we've already processed this invoice
    const alreadyProcessed = await hasProcessedStripeId(invoice.id);
    if (alreadyProcessed) {
        console.log(`Idempotency hit for invoice ${invoice.id}`);
        return;
    }
    const customerId = invoice.customer as string;
    
    // Get user ID from customer metadata
    const userId = await getUserIdFromCustomer(stripe, customerId);
    if (!userId) {
        throw new Error("No user ID found in customer metadata");
    }

    // For subscriptions, give 50 credits monthly (pro plan)
    const creditsToAdd = 50; // Pro plan gets 50 credits per month
    const success = await addCreditsToUser(
        userId, 
        creditsToAdd, 
        `Pro subscription renewal - ${creditsToAdd} credits`, 
        invoice.id
    );
    
    if (!success) throw new Error("Failed to add subscription credits");
    console.log(`✅ Added ${creditsToAdd} subscription credits to user ${userId}`);
}