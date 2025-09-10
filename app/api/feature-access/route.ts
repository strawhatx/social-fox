import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkFeatureAccess, getFeatureQuotaStatus } from '@/lib/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const feature = url.searchParams.get('feature') as 'posts' | 'ai_posts' | 'ai_rewrites' | 'starter_library_access' | 'my_library_access';
    
    if (!feature) {
      return NextResponse.json({ error: 'Feature parameter required' }, { status: 400 });
    }

    const hasAccess = await checkFeatureAccess(userId, feature);
    
    // For quota-based features, get the quota status
    let quota = null;
    if (feature === 'posts' || feature === 'ai_posts' || feature === 'ai_rewrites') {
      quota = await getFeatureQuotaStatus(userId, feature);
    }

    return NextResponse.json({ 
      feature,
      hasAccess,
      quota
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
