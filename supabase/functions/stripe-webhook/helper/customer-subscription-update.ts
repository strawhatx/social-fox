import Stripe from "npm:stripe@14.21.0";
import { supabase } from "../../utils/supabase.ts";
import { getUserByEmail, createUserProfile } from "./util.ts";

export const handleCustomerSubscriptionUpdate = async (stripe: Stripe, data: Stripe.Event.Data) => {
  const subscription = await stripe.subscriptions.retrieve(data.object.id);
  const customer = await stripe.customers.retrieve(subscription.customer as string);

  if (!customer || ("deleted" in customer && customer.deleted) || !customer.email) {
    throw new Error('Customer not found or has no email');
  }

  // Get or create user profile a user should exist we shouldnt have to create
  let user = await getUserByEmail(customer.email);
  if (!user) throw new Error('User not found');

  const status = subscription.status;
  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

  const subscriptionIsActive = status === 'active' || status === 'trialing' || status === 'past_due';

  console.log(`🔄 Updating subscription for user: ${user.id}`, {
    subscriptionId: subscription.id,
    status,
    priceId,
    currentPeriodEnd
  });

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_is_active: subscriptionIsActive,
      subscription_price_id: priceId,
      current_period_end: currentPeriodEnd,
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update profile for user ${user.id}: ${error.message}`);
  }
};