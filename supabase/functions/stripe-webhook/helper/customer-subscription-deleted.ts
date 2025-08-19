import Stripe from "npm:stripe@14.21.0";
import { getUserIdFromCustomer } from "./util.ts";
import { supabase } from "../../utils/supabase.ts";

export const handleCustomerSubscriptionDeleted = async (stripe: Stripe, data: Stripe.Event.Data) => {
    // Subscription cancelled - user reverts to free plan (10 credits)
    const subscription = data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Get user ID from customer metadata
    const userId = await getUserIdFromCustomer(stripe, customerId);
    if (!userId) {
        console.error("No user ID found in customer metadata");
        return;
    }

    // Reset user to free plan (10 credits, no additional credits)
    const { error } = await supabase
        .from('user_credits')
        .update({ 
            credits: 10,
            additional_credits: null,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating user credits on subscription cancellation:', error);
        return;
    }

    console.log(`✅ Reset user ${userId} to free plan (10 credits) due to subscription cancellation`);
}