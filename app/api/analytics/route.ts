import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db/data/users';
import { auth } from '@clerk/nextjs/server';
import { getAggregatedAnalytics } from '@/lib/db/data/analytics_snapshots';

export const dynamic = 'force-dynamic';

/** Utility: JSON response */
function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

/** GET: fetch analytics data */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data using snapshots
    const analyticsData = await getAggregatedAnalytics(appUserId, startDate, now);

    // Fetch Twitter account data for follower tracking
    const twitterAccount = await prisma.twitterAccount.findFirst({
      where: { userId: appUserId },
      orderBy: { lastSyncedAt: 'desc' },
    });

    return json({
      data: {
        stats: {
          totalPosts: analyticsData.stats.totalPosts,
          totalImpressions: analyticsData.stats.totalImpressions,
          engagementRate: analyticsData.stats.engagementRate,
          totalFollowers: twitterAccount?.followersCount || 0,
          totalLikes: analyticsData.stats.totalLikes,
          totalRetweets: analyticsData.stats.totalRetweets,
          totalComments: analyticsData.stats.totalReplies, // Note: using replies instead of comments
          totalBookmarks: 0, // Not tracked in snapshots yet
        },
        engagementData: analyticsData.engagementData,
        topPosts: analyticsData.topPosts,
        twitterAccount: twitterAccount ? {
          followersCount: twitterAccount.followersCount,
          followingCount: twitterAccount.followingCount,
          tweetCount: twitterAccount.tweetCount,
          lastSyncedAt: twitterAccount.lastSyncedAt,
        } : null,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
