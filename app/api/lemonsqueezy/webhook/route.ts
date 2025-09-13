import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializeUserQuotas } from '@/lib/subscriptions';
import crypto from 'crypto';
import { resolveUserFromWebhookData } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Lemon Squeezy webhook received');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    const body = await request.text();
    console.log('Raw body:', body);
    
    const signature = request.headers.get('x-signature');
    console.log('Signature from header:', signature);
    
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    console.log('Secret configured:', !!secret);
    
    if (!secret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Verify webhook signature (temporarily disabled for testing)
    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      
      console.log('Expected signature:', expectedSignature);
      console.log('Signature match:', signature === expectedSignature);
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('No signature provided - skipping verification for testing');
    }

    const data = JSON.parse(body);
    const { meta, data: eventData } = data;

    console.log('Lemon Squeezy webhook received:', meta.event_name, eventData);

    // Handle different webhook events
    switch (meta.event_name) {
      case 'order_created':
      case 'subscription_created':
      case 'subscription_payment_success':
      case 'subscription_payment_recovered':
        await handleSubscriptionActivated(eventData, meta);
        break;
        
      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_paused':
      case 'subscription_payment_failed':
        await handleSubscriptionDeactivated(eventData);
        break;
        
      case 'subscription_resumed':
      case 'subscription_unpaused':
        await handleSubscriptionActivated(eventData, meta);
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
        console.log('Unhandled webhook event:', meta.event_name);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(eventData: any, meta: any) {
  const { attributes } = eventData;
  const { customer_id, identifier, user_email, first_order_item } = attributes;
  const { product_id, variant_id } = first_order_item;
  const { custom_data } = meta;
  
  console.log('Processing order:', { customer_id, identifier, user_email, product_id, variant_id, custom_data });
  
  // Resolve user from webhook data
  const user = await resolveUserFromWebhookData(
    customer_id?.toString() || '',
    identifier,
    custom_data
  );

  if (!user) {
    console.error('Could not resolve user from webhook data');
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
      subscriptionId: customer_id?.toString() || identifier,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Orders don't have renewal dates
    }
  });

  // Initialize feature quotas for the new plan
  await initializeUserQuotas(user.id, plan);

  console.log('Order processed for user:', user.id, 'plan:', plan);
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
  // Based on your webhook data: product_id: 631823, variant_id: 991143
  const planMapping: Record<string, string> = {
    '631823': 'explore', // Your Explore product ID
    '991018': 'creative', // Your Creative product ID
    '991067': 'creative', // Your Creative product ID
    // Add your Creative product ID when you have it
  };

  // Check variant first, then product
  if (variantId && planMapping[variantId]) {
    return planMapping[variantId];
  }
  
  if (planMapping[productId]) {
    return planMapping[productId];
  }

  // Default to explore if no mapping found
  console.log('Unknown product/variant:', { productId, variantId });
  return 'explore';
}
