import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, getCustomerPortalUrl } from '@/lib/subscriptions';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!subscription.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const portalUrl = await getCustomerPortalUrl(subscription.subscriptionId);
    if (!portalUrl) {
      return NextResponse.json({ error: 'Failed to create customer portal' }, { status: 500 });
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Error creating customer portal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
