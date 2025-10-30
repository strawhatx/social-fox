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
  const totalInteractions = data.likes + data.retweets + data.replies;
  const engagementRate = data.impressions && data.impressions > 0
    ? (totalInteractions / data.impressions) * 100
    : null;

  const existing = await prisma.analyticsSnapshot.findFirst({
    where: {
      postId,
      snapshotDate,
      itemId: itemId ? { equals: itemId } : { equals: null },
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
      postId,
      itemId: itemId ?? null,
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
      postId,
      itemId: itemId || null,
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
      postId: { in: postIds },
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
      postId,
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
  // Get all posted content posts for the user
  const posts = await prisma.contentPost.findMany({
    where: {
      userId,
      status: 'posted',
      postedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      analyticsSnapshots: {
        where: {
          snapshotDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { snapshotDate: 'asc' },
      },
    },
  });

  // Calculate totals
  const totalStats = {
    totalPosts: posts.length,
    totalLikes: 0,
    totalRetweets: 0,
    totalReplies: 0,
    totalImpressions: 0,
  };

  // Get the latest snapshot for each post to calculate totals
  for (const post of posts) {
    if (post.analyticsSnapshots.length > 0) {
      const latestSnapshot = post.analyticsSnapshots[post.analyticsSnapshots.length - 1];
      totalStats.totalLikes += latestSnapshot.likes;
      totalStats.totalRetweets += latestSnapshot.retweets;
      totalStats.totalReplies += latestSnapshot.replies;
      totalStats.totalImpressions += latestSnapshot.impressions || 0;
    }
  }

  // Calculate engagement rate
  const totalInteractions = totalStats.totalLikes + totalStats.totalRetweets + totalStats.totalReplies;
  const engagementRate = totalStats.totalImpressions > 0 
    ? (totalInteractions / totalStats.totalImpressions) * 100 
    : 0;

  // Group snapshots by date for chart data
  const engagementByDate: Record<string, any> = {};
  
  for (const post of posts) {
    for (const snapshot of post.analyticsSnapshots) {
      const date = snapshot.snapshotDate.toISOString().split('T')[0];
      if (!engagementByDate[date]) {
        engagementByDate[date] = {
          date,
          likes: 0,
          retweets: 0,
          replies: 0,
          impressions: 0,
        };
      }
      engagementByDate[date].likes += snapshot.likes;
      engagementByDate[date].retweets += snapshot.retweets;
      engagementByDate[date].replies += snapshot.replies;
      engagementByDate[date].impressions += snapshot.impressions || 0;
    }
  }

  const chartData = Object.values(engagementByDate).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get top performing posts
  const topPosts = posts
    .map(post => {
      if (post.analyticsSnapshots.length === 0) return null;
      
      const latestSnapshot = post.analyticsSnapshots[post.analyticsSnapshots.length - 1];
      const totalInteractions = latestSnapshot.likes + latestSnapshot.retweets + latestSnapshot.replies;
      const engagement = latestSnapshot.impressions && latestSnapshot.impressions > 0 
        ? (totalInteractions / latestSnapshot.impressions) * 100 
        : 0;

      return {
        id: post.id,
        content: post.items?.[0]?.content || '',
        date: post.postedAt?.toISOString().split('T')[0] || '',
        likes: latestSnapshot.likes,
        retweets: latestSnapshot.retweets,
        replies: latestSnapshot.replies,
        impressions: latestSnapshot.impressions || 0,
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
