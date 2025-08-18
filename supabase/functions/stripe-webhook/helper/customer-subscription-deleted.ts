import Stripe from "npm:stripe@14.21.0";
import { getUserByEmail, revokeUserAccess } from "./util.ts";

export const handleCustomerSubscriptionDeleted = async (stripe: Stripe, data: Stripe.Event.Data) => {
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
}