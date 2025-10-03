import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/subscriptions';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isAdmin(userId)) {
      // Return a virtual active subscription for admins
      return NextResponse.json({
        data: {
          plan: 'creator',
          status: 'active',
          subscriptionId: 'admin-bypass',
          expiry: null,
          planDetails: {
            id: 'creator',
            name: 'Creator',
            price: 0,
            interval: 'month',
            features: [],
            limits: {}
          }
        }
      });
    }

    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
