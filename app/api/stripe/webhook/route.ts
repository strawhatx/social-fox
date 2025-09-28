import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { customerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  // Update user subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      subscriptionStatus: subscription.status,
      subscriptionId: subscription.id,
      // current_period_end moved from Subscription to SubscriptionItem in newer Stripe SDKs
      subscriptionExpiry: subscription.items.data[0]?.current_period_end
        ? new Date((subscription.items.data[0] as any).current_period_end * 1000)
        : null,
    }
  });

  console.log(`Subscription updated for user ${user.id}: ${plan} (${subscription.status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { customerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Remove subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: null,
      subscriptionStatus: 'canceled',
      subscriptionId: null,
      subscriptionExpiry: null,
    }
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findFirst({
    where: { customerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status to active
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
    }
  });

  console.log(`Payment succeeded for user ${user.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { customerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    }
  });

  console.log(`Payment failed for user ${user.id}`);
}

function getPlanFromPriceId(priceId: string): string {
  // Map your Stripe price IDs to plan names
  const planMapping: Record<string, string> = {
    'price_explore_monthly': 'explore',
    'price_creator_monthly': 'creator',
    // Add your actual Stripe price IDs here
  };

  return planMapping[priceId] || 'explore';
}