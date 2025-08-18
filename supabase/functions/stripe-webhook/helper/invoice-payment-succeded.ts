import Stripe from "npm:stripe@14.21.0";
import { addAdditionalCreditsToUser, addCreditsToUser, PRICE_ID_TO_ADDITIONAL_CREDITS, PRICE_ID_TO_CREDITS } from "./util.ts";

export const handleInvoicePaymentSucceeded = async (stripe: Stripe, data: Stripe.Event.Data) => {
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
}