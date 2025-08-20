import Stripe from "npm:stripe@14.21.0";
import { 
    getUserByEmail,
    addCreditsToUser, 
    hasProcessedStripeId, 
    PRICE_ID_TO_CREDITS 
} from "./util.ts";

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
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    const user = await getUserByEmail(customer.email);
    const priceId = invoice.lines.data[0]?.price?.id;

    // Subscription credits only
    const creditsToAdd = priceId ? PRICE_ID_TO_CREDITS[priceId] : 0;
    await addCreditsToUser(user.id, creditsToAdd, `Subscription renewal - ${creditsToAdd} credits`, invoice.id);
}