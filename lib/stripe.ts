import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export { stripe };

// Get or create Stripe customer for Clerk user
export async function getOrCreateStripeCustomer(clerkUserId: string, email?: string): Promise<string> {
  // Check if user already has a Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { customerId: true }
  });

  if (user?.customerId) {
    return user.customerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      clerk_user_id: clerkUserId,
    },
  });

  // Store customer ID in database
  await prisma.user.update({
    where: { clerkUserId },
    data: { customerId: customer.id }
  });

  return customer.id;
}

// Create Stripe Checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
}

// Create Stripe Billing Portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Get subscription status for a customer
export async function getCustomerSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] || null;
}