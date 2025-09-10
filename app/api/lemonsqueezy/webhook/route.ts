import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { initializeUserQuotas } from '@/lib/subscriptions';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.LEMON_API_KEY!)
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
      case 'subscription_renewed':
        await handleSubscriptionActivated(eventData);
        break;
        
      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_paused':
        await handleSubscriptionDeactivated(eventData);
        break;
        
      case 'subscription_resumed':
        await handleSubscriptionActivated(eventData);
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

  // Downgrade to free plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'free',
      subscriptionStatus: 'inactive',
      subscriptionExpiry: null
    }
  });

  console.log('Subscription deactivated for user:', user.id);
}

function determinePlanFromProduct(productId: string, variantId?: string): string {
  // Map your Lemon Squeezy product IDs to plan names
  // You'll need to update these with your actual product IDs
  const planMapping: Record<string, string> = {
    '631823': 'explore',
    '631761': 'creative',
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
