import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export interface SnapshotData {
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  engagementRate?: number;
}

export interface CreateSnapshotParams {
  postId: string;
  itemId?: string; // Optional - if provided, creates snapshot for specific item
  snapshotDate: Date;
  data: SnapshotData;
}

/**
 * Create or update an analytics snapshot for a post (and optional item)
 */
export async function createAnalyticsSnapshot(
  postId: string,
  snapshotDate: Date,
  data: SnapshotData,
  itemId?: string
) {
  if (!itemId) {
    throw new Error('itemId is required to create analytics snapshot');
  }
  const totalInteractions = data.likes + data.retweets + data.replies;
  const engagementRate = data.impressions && data.impressions > 0
    ? (totalInteractions / data.impressions) * 100
    : null;

  const existing = await prisma.analyticsSnapshot.findFirst({
    where: {
      itemId,
      snapshotDate,
    },
  });

  if (existing) {
    return prisma.analyticsSnapshot.update({
      where: { id: existing.id },
      data: {
        likes: data.likes,
        retweets: data.retweets,
        replies: data.replies,
        impressions: data.impressions ?? 0,
        engagementRate: engagementRate ?? undefined,
      },
    });
  }

  return prisma.analyticsSnapshot.create({
    data: {
      itemId,
      snapshotDate,
      likes: data.likes,
      retweets: data.retweets,
      replies: data.replies,
      impressions: data.impressions ?? 0,
      engagementRate: engagementRate ?? undefined,
    },
  });
}

/**
 * Get analytics snapshots for a post within a date range
 */
export async function getAnalyticsSnapshots(
  postId: string,
  startDate: Date,
  endDate: Date,
  itemId?: string
) {
  return prisma.analyticsSnapshot.findMany({
    where: {
      item: { postId },
      ...(itemId ? { itemId } : {}),
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { snapshotDate: 'asc' },
  });
}

/**
 * Get snapshots for multiple posts by IDs
 */
export async function getAnalyticsSnapshotsForPosts(
  postIds: string[],
  startDate: Date,
  endDate: Date
) {
  return prisma.analyticsSnapshot.findMany({
    where: {
      item: { postId: { in: postIds } },
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      item: true,
    },
    orderBy: { snapshotDate: 'asc' },
  });
}

/**
 * Get aggregated snapshots for a content post (sum of all items)
 */
export async function getAggregatedPostSnapshots(
  postId: string,
  startDate: Date,
  endDate: Date
) {
  const snapshots = await prisma.analyticsSnapshot.findMany({
    where: {
      item: { postId },
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { snapshotDate: 'asc' },
  });

  // Group by date and aggregate
  const aggregatedByDate: Record<string, any> = {};
  
  for (const snapshot of snapshots) {
    const date = snapshot.snapshotDate.toISOString().split('T')[0];
    if (!aggregatedByDate[date]) {
      aggregatedByDate[date] = {
        date,
        likes: 0,
        retweets: 0,
        replies: 0,
        impressions: 0,
      };
    }
    
    aggregatedByDate[date].likes += snapshot.likes;
    aggregatedByDate[date].retweets += snapshot.retweets;
    aggregatedByDate[date].replies += snapshot.replies;
    aggregatedByDate[date].impressions += snapshot.impressions || 0;
  }

  return Object.values(aggregatedByDate).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get aggregated analytics data for multiple posts
 */
export async function getAggregatedAnalytics(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // Fetch item-level snapshots within range and traverse back to posts
  const snapshots = await prisma.analyticsSnapshot.findMany({
    where: {
      snapshotDate: {
        gte: startDate,
        lte: endDate,
      },
      item: {
        post: {
          userId,
        },
      },
    },
    include: {
      item: {
        include: {
          post: { include: { items: true } },
        },
      },
    },
    orderBy: { snapshotDate: 'asc' },
  });

  // Get all posted content posts for the user (metadata only)
  const posts = await prisma.contentPost.findMany({
    where: {
      userId,
      status: 'posted',
      postedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { items: true },
  });

  // Calculate totals
  const totalStats = {
    totalPosts: posts.length,
    totalLikes: 0,
    totalRetweets: 0,
    totalReplies: 0,
    totalImpressions: 0,
  };

  // Build per-post latest totals by aggregating the latest snapshot per item
  const snapshotsByPost: Record<string, typeof snapshots> = {} as any;
  for (const s of snapshots) {
    const item = s.item;
    const postId = item?.post?.id;
    if (!item || !postId) continue;
    if (!snapshotsByPost[postId]) snapshotsByPost[postId] = [] as any;
    snapshotsByPost[postId].push(s);
  }

  const perPostLatestTotals: Record<string, { likes: number; retweets: number; replies: number; impressions: number } > = {};
  for (const post of posts) {
    const postSnapshots = snapshotsByPost[post.id] || [];
    // Group by itemId, take the latest snapshot per item (snapshots are asc ordered, so last wins)
    const latestByItem: Record<string, { likes: number; retweets: number; replies: number; impressions: number }> = {};
    for (const s of postSnapshots) {
      const item = s.item;
      if (!item) continue;
      latestByItem[item.id] = {
        likes: s.likes,
        retweets: s.retweets,
        replies: s.replies,
        impressions: s.impressions || 0,
      };
    }
    const agg = Object.values(latestByItem).reduce(
      (acc, cur) => {
        acc.likes += cur.likes;
        acc.retweets += cur.retweets;
        acc.replies += cur.replies;
        acc.impressions += cur.impressions;
        return acc;
      },
      { likes: 0, retweets: 0, replies: 0, impressions: 0 }
    );
    perPostLatestTotals[post.id] = agg;
    totalStats.totalLikes += agg.likes;
    totalStats.totalRetweets += agg.retweets;
    totalStats.totalReplies += agg.replies;
    totalStats.totalImpressions += agg.impressions;
  }

  // Calculate engagement rate
  const totalInteractions = totalStats.totalLikes + totalStats.totalRetweets + totalStats.totalReplies;
  const engagementRate = totalStats.totalImpressions > 0 
    ? (totalInteractions / totalStats.totalImpressions) * 100 
    : 0;

  // Group item-level snapshots by date for chart data
  const engagementByDate: Record<string, any> = {};
  
  for (const s of snapshots) {
    const date = s.snapshotDate.toISOString().split('T')[0];
    if (!engagementByDate[date]) {
      engagementByDate[date] = {
        date,
        likes: 0,
        retweets: 0,
        replies: 0,
        impressions: 0,
      };
    }
    engagementByDate[date].likes += s.likes;
    engagementByDate[date].retweets += s.retweets;
    engagementByDate[date].replies += s.replies;
    engagementByDate[date].impressions += s.impressions || 0;
  }

  const chartData = Object.values(engagementByDate).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get top performing posts using per-post latest totals
  const topPosts = posts
    .map(post => {
      const agg = perPostLatestTotals[post.id] || { likes: 0, retweets: 0, replies: 0, impressions: 0 };
      const totalInteractions = agg.likes + agg.retweets + agg.replies;
      const engagement = agg.impressions > 0 ? (totalInteractions / agg.impressions) * 100 : 0;
      return {
        id: post.id,
        content: post.items?.[0]?.content || '',
        date: post.postedAt?.toISOString().split('T')[0] || '',
        likes: agg.likes,
        retweets: agg.retweets,
        replies: agg.replies,
        impressions: agg.impressions,
        engagement: Math.round(engagement * 10) / 10,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.engagement - a.engagement)
    .slice(0, 10);

  return {
    stats: {
      ...totalStats,
      engagementRate: Math.round(engagementRate * 10) / 10,
    },
    engagementData: chartData,
    topPosts,
  };
}
