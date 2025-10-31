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
      case '14d':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
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

    // Extended coaching data: breakdown, timing, consistency, bottom post
    // Fetch posted posts in range with items
    const posts = await prisma.contentPost.findMany({
      where: {
        userId: appUserId,
        status: 'posted',
        postedAt: { gte: startDate, lte: now },
      },
      include: { items: true },
      orderBy: { postedAt: 'asc' },
    });

    // Fetch snapshots for items to compute per-post engagement
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        snapshotDate: { gte: startDate, lte: now },
        item: { post: { userId: appUserId } },
      },
      include: { item: { include: { post: true } } },
      orderBy: { snapshotDate: 'asc' },
    });

    // Build per-post latest totals (latest per item)
    const snapshotsByPost: Record<string, typeof snapshots> = {} as any;
    for (const s of snapshots) {
      const postId = s.item?.post?.id;
      if (!postId) continue;
      if (!snapshotsByPost[postId]) snapshotsByPost[postId] = [] as any;
      snapshotsByPost[postId].push(s);
    }

    const perPostTotals: Record<string, { likes: number; retweets: number; replies: number; impressions: number; engagement: number }> = {};
    for (const post of posts) {
      const postSnaps = snapshotsByPost[post.id] || [];
      const latestByItem: Record<string, { likes: number; retweets: number; replies: number; impressions: number }> = {};
      for (const s of postSnaps) {
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
      const interactions = agg.likes + agg.retweets + agg.replies;
      const engagement = agg.impressions > 0 ? (interactions / agg.impressions) * 100 : 0;
      perPostTotals[post.id] = { ...agg, engagement };
    }

    // Classify post types
    type BreakdownKey = 'shortTweets' | 'threads' | 'gifs' | 'images' | 'textOnly';
    const groups: Record<BreakdownKey, { ids: string[]; engagements: number[] }> = {
      shortTweets: { ids: [], engagements: [] },
      threads: { ids: [], engagements: [] },
      gifs: { ids: [], engagements: [] },
      images: { ids: [], engagements: [] },
      textOnly: { ids: [], engagements: [] },
    };

    const isGif = (media: any[]) => (media || []).some((m: any) => m?.type === 'image/gif');
    const hasImage = (media: any[]) => (media || []).some((m: any) => (m?.type || '').startsWith('image/') && m?.type !== 'image/gif');

    for (const post of posts) {
      const totals = perPostTotals[post.id];
      if (!totals) continue;
      const items = post.items || [];
      const main = items[0];
      const contentLen = (main?.content || '').length;
      const anyGif = items.some((it: any) => isGif((it as any).media || []));
      const anyImage = items.some((it: any) => hasImage((it as any).media || []));
      const isThread = items.length > 1;
      const isShort = items.length === 1 && contentLen <= 120;
      const isTextOnly = !anyGif && !anyImage;

      if (isShort) {
        groups.shortTweets.ids.push(post.id);
        groups.shortTweets.engagements.push(totals.engagement);
      }
      if (isThread) {
        groups.threads.ids.push(post.id);
        groups.threads.engagements.push(totals.engagement);
      }
      if (anyGif) {
        groups.gifs.ids.push(post.id);
        groups.gifs.engagements.push(totals.engagement);
      }
      if (anyImage) {
        groups.images.ids.push(post.id);
        groups.images.engagements.push(totals.engagement);
      }
      if (isTextOnly) {
        groups.textOnly.ids.push(post.id);
        groups.textOnly.engagements.push(totals.engagement);
      }
    }

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const breakdown = {
      shortTweets: { avgEngagement: Math.round(avg(groups.shortTweets.engagements) * 10) / 10, count: groups.shortTweets.ids.length },
      threads: { avgEngagement: Math.round(avg(groups.threads.engagements) * 10) / 10, count: groups.threads.ids.length },
      gifs: { avgEngagement: Math.round(avg(groups.gifs.engagements) * 10) / 10, count: groups.gifs.ids.length },
      images: { avgEngagement: Math.round(avg(groups.images.engagements) * 10) / 10, count: groups.images.ids.length },
      comparisonText: undefined as string | undefined,
    };

    // Comparison: GIFs vs text-only
    const gifAvg = avg(groups.gifs.engagements);
    const textAvg = avg(groups.textOnly.engagements);
    if (gifAvg && textAvg) {
      const delta = Math.round(((gifAvg - textAvg) / (textAvg || 1)) * 100);
      const sign = delta >= 0 ? '+' : '';
      breakdown.comparisonText = `GIFs outperform text-only by ${sign}${delta}% engagement.`;
    }

    // Timing insight
    const globalAvg = avg(Object.values(perPostTotals).map(v => v.engagement));
    type Slot = { dayOfWeek: number; hourStart: number; hourEnd: number; avgEngagement: number; factor: number };
    const slots: Slot[] = [];

    // Build per (day, hour) buckets
    const byDayHour: Record<string, number[]> = {};
    for (const post of posts) {
      const postedAt = post.postedAt as Date | null;
      const e = perPostTotals[post.id]?.engagement;
      if (!postedAt || e === undefined) continue;
      const dow = postedAt.getDay();
      const hour = postedAt.getHours();
      const key = `${dow}:${hour}`;
      if (!byDayHour[key]) byDayHour[key] = [];
      byDayHour[key].push(e);
    }
    // Compute sliding 3-hour windows per day
    for (let dow = 0; dow < 7; dow++) {
      for (let h = 0; h <= 21; h++) {
        const hours = [h, h + 1, h + 2];
        const vals: number[] = [];
        for (const hh of hours) {
          const key = `${dow}:${hh}`;
          if (byDayHour[key] && byDayHour[key].length) vals.push(...byDayHour[key]);
        }
        if (vals.length) {
          const a = avg(vals);
          slots.push({ dayOfWeek: dow, hourStart: h, hourEnd: h + 3, avgEngagement: a, factor: globalAvg ? a / globalAvg : 1 });
        }
      }
    }
    slots.sort((a, b) => b.avgEngagement - a.avgEngagement);
    const topSlots = slots.slice(0, 3).map(s => ({ dayOfWeek: s.dayOfWeek, hourStart: s.hourStart, hourEnd: s.hourEnd, factor: Math.round(s.factor * 10) / 10 }));

    // Heatmap: factor per exact hour slot
    const heatmap: Array<{ dayOfWeek: number; hour: number; factor: number }> = [];
    for (let dow = 0; dow < 7; dow++) {
      for (let h = 0; h < 24; h++) {
        const vals = byDayHour[`${dow}:${h}`] || [];
        const a = avg(vals);
        const factor = globalAvg ? (a / globalAvg) : 0;
        heatmap.push({ dayOfWeek: dow, hour: h, factor: Math.round(factor * 10) / 10 });
      }
    }

    const dowName = (d: number) => ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][d] || 'Days';
    const hrLabel = (h: number) => {
      const to12 = (x: number) => ((x % 12) || 12);
      const ampm = (x: number) => (x < 12 ? 'AM' : 'PM');
      return `${to12(h)} ${ampm(h)}`;
    };
    const best = topSlots[0];
    const bestWindowText = best
      ? `${dowName(best.dayOfWeek)} ${hrLabel(best.hourStart)} – ${hrLabel(best.hourEnd)} get ${best.factor}× engagement.`
      : '';

    // Consistency
    const today = new Date();
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const postedDaysSet = new Set(posts.filter(p => p.postedAt).map(p => dayKey(p.postedAt as Date)));
    // streak ending today
    let streakDays = 0;
    for (let i = 0; i < 30; i++) { // cap search at 30 days
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (postedDaysSet.has(dayKey(d))) streakDays++;
      else break;
    }
    // this week (last 7 days) and activity list (oldest..today)
    let daysPostedThisWeek = 0;
    const weekActivity: Array<{ date: string; posted: boolean }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dayKey(d);
      const posted = postedDaysSet.has(key);
      if (posted) daysPostedThisWeek++;
      weekActivity.push({ date: key, posted });
    }
    const missedDaysThisWeek = Math.max(0, 7 - daysPostedThisWeek);

    // Performance summary top/bottom
    const perPostList = posts.map(p => ({
      id: p.id,
      content: p.items?.[0]?.content || '',
      date: (p.postedAt ? (p.postedAt as Date).toISOString().split('T')[0] : ''),
      ...perPostTotals[p.id],
    })).filter(x => x && x.engagement !== undefined);
    const top = [...perPostList].sort((a: any, b: any) => (b.engagement || 0) - (a.engagement || 0))[0] || null;
    const bottom = [...perPostList].sort((a: any, b: any) => (a.engagement || 0) - (b.engagement || 0))[0] || null;

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
        performanceSummary: {
          top: top
            ? {
                id: top.id,
                content: top.content,
                date: top.date,
                likes: top.likes,
                retweets: top.retweets,
                replies: top.replies,
                impressions: top.impressions,
                engagement: Math.round((top.engagement || 0) * 10) / 10,
              }
            : null,
          bottom: bottom
            ? {
                id: bottom.id,
                content: bottom.content,
                date: bottom.date,
                likes: bottom.likes,
                retweets: bottom.retweets,
                replies: bottom.replies,
                impressions: bottom.impressions,
                engagement: Math.round((bottom.engagement || 0) * 10) / 10,
              }
            : null,
        },
        breakdown,
        timing: { bestWindowText, topSlots, heatmap },
        consistency: { streakDays, daysPostedThisWeek, missedDaysThisWeek, weekActivity },
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
