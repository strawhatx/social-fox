import Stripe from "npm:stripe@14.21.0";
import { 
    getUserByEmail, 
    addCreditsToUser, 
    createUserProfile, 
    PRICE_ID_TO_CREDITS, 
    PRICE_ID_TO_ADDITIONAL_CREDITS, 
    addAdditionalCreditsToUser 
} from "./util.ts";

export const handleCheckoutSessionCompleted = async (stripe: Stripe, data: Stripe.Event.Data) => {
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

    // Determine additional credits to add based on price ID
    if (priceId && PRICE_ID_TO_ADDITIONAL_CREDITS[priceId]) {
        const additionalCredits = PRICE_ID_TO_ADDITIONAL_CREDITS[priceId] : 0;

        // TODO: add additional credits to user account
        const success = await addAdditionalCreditsToUser(customer.id, additionalCredits, `Additional credits purchased - ${additionalCredits} credits`, invoice.id);

        if (!success) {
            throw new Error('Failed to add additional credits to user account');
        }

        console.log(`Successfully added ${additionalCredits} additional credits to user ${user.email}`);
    }
    // Determine credits to add based on price ID
    else if (priceId && PRICE_ID_TO_CREDITS[priceId]) {
        // TODO: add credits to user account
        const creditsToAdd = priceId ? PRICE_ID_TO_CREDITS[priceId] : 0;

        const success = await addCreditsToUser(customer.id, creditsToAdd, `Credits purchased - ${creditsToAdd} credits`, invoice.id);

        if (!success) {
            throw new Error('Failed to add credits to user account');
        }

        console.log(`Successfully added ${creditsToAdd} credits to user ${user.email}`);
    }
    // No credits to add - price id not found
    else {
        console.log(`No credits configured for price ID: ${priceId}`);
    }
}