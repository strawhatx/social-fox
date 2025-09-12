import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializeUserQuotas } from '@/lib/subscriptions';
import crypto from 'crypto';
import { products } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    console.log('Lemon Squeezy webhook received');

    const body = await request.text();
    const signature = request.headers.get('x-signature');
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { event, data: eventData } = data;

    console.log('Lemon Squeezy webhook received:', event, eventData);

    // Handle different webhook events
    switch (event) {
      case 'order_created':
      case 'subscription_created':
      case 'subscription_payment_success':
      case 'subscription_payment_recovered':
        await handleSubscriptionActivated(eventData);
        break;
        
      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_paused':
      case 'subscription_payment_failed':
        await handleSubscriptionDeactivated(eventData);
        break;
        
      case 'subscription_resumed':
      case 'subscription_unpaused':
        await handleSubscriptionActivated(eventData);
        break;
        
      case 'subscription_updated':
      case 'subscription_plan_changed':
        await handleSubscriptionUpdated(eventData);
        break;
        
      case 'order_refunded':
      case 'subscription_payment_refunded':
        await handleSubscriptionRefunded(eventData);
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(eventData: any) {
  const { customer_id, subscription_id, product_id, variant_id } = eventData;
  
  // Find user by subscription_id or customer_id
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { subscriptionId: subscription_id },
        { subscriptionId: customer_id }
      ]
    }
  });

  if (!user) {
    console.error('User not found for subscription:', { subscription_id, customer_id });
    return;
  }

  // Determine plan based on product_id or variant_id
  const plan = determinePlanFromProduct(product_id, variant_id);
  
  // Update user subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: plan,
      subscriptionStatus: 'active',
      subscriptionId: subscription_id || customer_id,
      subscriptionExpiry: eventData.renews_at ? new Date(eventData.renews_at) : null
    }
  });

  // Initialize feature quotas for the new plan
  await initializeUserQuotas(user.id, plan);

  console.log('Subscription activated for user:', user.id, 'plan:', plan);
}

async function handleSubscriptionDeactivated(eventData: any) {
  const { subscription_id, customer_id } = eventData;
  
  // Find user by subscription_id or customer_id
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { subscriptionId: subscription_id },
        { subscriptionId: customer_id }
      ]
    }
  });

  if (!user) {
    console.error('User not found for subscription:', { subscription_id, customer_id });
    return;
  }

  // Remove plan access (no free plan)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: null,
      subscriptionStatus: 'inactive',
      subscriptionExpiry: null
    }
  });

  console.log('Subscription deactivated for user:', user.id);
}

async function handleSubscriptionUpdated(eventData: any) {
  const { customer_id, subscription_id, product_id, variant_id } = eventData;
  
  // Find user by subscription_id or customer_id
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { subscriptionId: subscription_id },
        { subscriptionId: customer_id }
      ]
    }
  });

  if (!user) {
    console.error('User not found for subscription update:', { subscription_id, customer_id });
    return;
  }

  // Determine new plan based on product_id or variant_id
  const newPlan = determinePlanFromProduct(product_id, variant_id);
  
  // Update user subscription with new plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: newPlan,
      subscriptionStatus: 'active',
      subscriptionId: subscription_id || customer_id,
      subscriptionExpiry: eventData.renews_at ? new Date(eventData.renews_at) : null
    }
  });

  // Reinitialize feature quotas for the new plan
  await initializeUserQuotas(user.id, newPlan);

  console.log('Subscription updated for user:', user.id, 'new plan:', newPlan);
}

async function handleSubscriptionRefunded(eventData: any) {
  const { subscription_id, customer_id } = eventData;
  
  // Find user by subscription_id or customer_id
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { subscriptionId: subscription_id },
        { subscriptionId: customer_id }
      ]
    }
  });

  if (!user) {
    console.error('User not found for subscription refund:', { subscription_id, customer_id });
    return;
  }

  // Remove plan access due to refund
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: null,
      subscriptionStatus: 'inactive',
      subscriptionExpiry: null
    }
  });

  console.log('Subscription refunded for user:', user.id);
}

function determinePlanFromProduct(productId: string, variantId?: string): string {
  // Map your Lemon Squeezy product IDs to plan names
  // You'll need to update these with your actual product IDs
  const planMapping: Record<string, string> = {
    [products.explore]: 'explore',
    [products.creative]: 'creative',
  };

  // Check variant first, then product
  if (variantId && planMapping[variantId]) {
    return planMapping[variantId];
  }
  
  if (planMapping[productId]) {
    return planMapping[productId];
  }

  // Default to explore if no mapping found
  return 'explore';
}
