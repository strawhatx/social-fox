import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';
import { getAllUserUsage, getUserUsage } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin bypass: return empty usage or a permissive payload
    if (isAdmin(userId)) {
      const searchParams = request.nextUrl.searchParams;
      const feature = searchParams.get('feature');
      if (feature) {
        return NextResponse.json({ userId, feature, used: 0, limit: Number.MAX_SAFE_INTEGER, period: { start: new Date(0), end: new Date(8640000000000000) } });
      }
      return NextResponse.json([]);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const feature = searchParams.get('feature');

    if (feature) {
      // Get usage for specific feature
      const usage = await getUserUsage(user.id, feature);
      return NextResponse.json(usage);
    } else {
      // Get all usage
      const allUsage = await getAllUserUsage(user.id);
      return NextResponse.json(allUsage);
    }
  } catch (error) {
    console.error('Error getting usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
