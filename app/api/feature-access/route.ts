import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { canUseFeature, getUserPlan } from '@/lib/usage-tracking';
import { FEATURES, getFeatureLimit } from '@/lib/features';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const featureName = searchParams.get('feature');

    if (featureName) {
      // Check specific feature access using new system
      const plan = await getUserPlan(user.id);
      const access = await canUseFeature(user.id, featureName);
      const limit = plan ? getFeatureLimit(featureName, plan) : 0;
      
      return NextResponse.json({
        canUse: access.canUse,
        reason: access.reason,
        currentPlan: plan,
        featureConfig: {
          ...FEATURES[featureName],
          used: access.usage?.used || 0,
          limit: limit
        }
      });
    } else {
      // Get all feature access - redirect to usage endpoint
      return NextResponse.redirect(new URL('/api/usage', request.url));
    }
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}