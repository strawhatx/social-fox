import { useEffect, useMemo, useState } from 'react';

export type ContentPost = {
  id: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  scheduled_at: string | null;
  posted_at: string | null;
  engagement: any | null;
  metadata: any | null;
};

type Stats = {
  totalLikes: number;
  totalRetweets: number;
  totalReplies: number;
  last7Likes: number;
  prev7Likes: number;
  last7Retweets: number;
  prev7Retweets: number;
  last7Replies: number;
  prev7Replies: number;
  currentWeekPosts: number;
  dailyStreak: number;
};

const formatNumber = (n: number) => new Intl.NumberFormat().format(Math.max(0, Math.round(n)));
const formatPercentChange = (curr: number, prev: number) => {
  if (prev <= 0 && curr <= 0) return '0%';
  if (prev <= 0) return '+100%';
  const change = ((curr - prev) / prev) * 100;
  const rounded = Math.round(change * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<ContentPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/content-posts`);
        const body = await res.json();
        const all = (body?.data || []) as ContentPost[];
        // Only posts with posted_at for dashboard stats
        const filtered = all.filter(p => !!p.posted_at);
        setPosts(filtered);
      } catch (e) {
        console.error('Error fetching dashboard stats posts:', e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const stats: Stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Start = new Date(startOfToday);
    last7Start.setDate(last7Start.getDate() - 6);
    const prev7Start = new Date(last7Start);
    prev7Start.setDate(prev7Start.getDate() - 7);
    const prev7End = new Date(last7Start);
    prev7End.setHours(23, 59, 59, 999);

    let totalLikes = 0, totalRetweets = 0, totalReplies = 0;
    let last7Likes = 0, last7Retweets = 0, last7Replies = 0;
    let prev7Likes = 0, prev7Retweets = 0, prev7Replies = 0;

    const postedDays = new Set<string>();

    for (const p of posts) {
      const postedAt = p.posted_at ? new Date(p.posted_at) : null;
      const eng = (p.engagement as unknown as { likes?: number; retweets?: number; replies?: number }) || {};
      const likes = eng.likes || 0;
      const retweets = eng.retweets || 0;
      const replies = eng.replies || 0;
      totalLikes += likes;
      totalRetweets += retweets;
      totalReplies += replies;
      if (postedAt) {
        const dayKey = new Date(postedAt.getFullYear(), postedAt.getMonth(), postedAt.getDate()).toISOString();
        postedDays.add(dayKey);
        if (postedAt >= last7Start && postedAt <= now) {
          last7Likes += likes;
          last7Retweets += retweets;
          last7Replies += replies;
        } else if (postedAt >= prev7Start && postedAt <= prev7End) {
          prev7Likes += likes;
          prev7Retweets += retweets;
          prev7Replies += replies;
        }
      }
    }

    // Current week posts (last 7 days)
    const currentWeekPosts = posts.filter(p => p.posted_at && new Date(p.posted_at) >= last7Start).length;

    // Daily streak: count consecutive days up to today with at least one post
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = d.toISOString();
      if (postedDays.has(key)) streak++;
      else break;
    }

    return {
      totalLikes,
      totalRetweets,
      totalReplies,
      last7Likes,
      prev7Likes,
      last7Retweets,
      prev7Retweets,
      last7Replies,
      prev7Replies,
      currentWeekPosts,
      dailyStreak: streak,
    };
  }, [posts]);

  const cards = useMemo(() => {
    const likesChange = formatPercentChange(stats.last7Likes, stats.prev7Likes);
    const retweetsChange = formatPercentChange(stats.last7Retweets, stats.prev7Retweets);
    const totalEngagements7 = stats.last7Likes + stats.last7Retweets + stats.last7Replies;
    const prevEngagements7 = stats.prev7Likes + stats.prev7Retweets + stats.prev7Replies;
    const engagementChange = formatPercentChange(totalEngagements7, prevEngagements7);
    // Placeholder potential reach: engagements * 10
    const potentialReach = totalEngagements7 * 10;
    return {
      totalLikes: { value: formatNumber(stats.totalLikes), change: likesChange },
      totalRetweets: { value: formatNumber(stats.totalRetweets), change: retweetsChange },
      potentialReach: { value: formatNumber(potentialReach), change: engagementChange },
      engagementRate: { value: `${Math.max(0, Math.round((totalEngagements7 / Math.max(1, stats.currentWeekPosts)) * 10) / 10)}%`, change: engagementChange },
    };
  }, [stats]);

  return {
    loading,
    dailyStreak: stats.dailyStreak,
    currentWeekPosts: stats.currentWeekPosts,
    cards,
  };
}


