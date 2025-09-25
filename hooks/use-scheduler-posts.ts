import { useEffect, useMemo, useState } from 'react';

type ContentPost = {
  id: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  scheduledAt: string | null;
  postedAt: string | null;
  engagement: any | null;
  metadata: any | null;
};

export type SchedulerItem = {
  id: string;
  content: string;
  platform: 'twitter' | 'x' | string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  scheduledTime: string | null;
  engagement: { likes?: number; shares?: number; comments?: number; retweets?: number; replies?: number } | null;
  source?: 'commit' | 'ai' | 'conversation' | string;
  metadata?: any;
};

export function useSchedulerPosts() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content-posts');
      const body = await res.json();
      const data = (body?.data as ContentPost[]) || [];
      setPosts(data);
    } catch (error) {
      console.error('Error fetching scheduler posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const items: SchedulerItem[] = useMemo(() => {
    return posts.map((p) => ({
      id: p.id,
      content: p.content,
      platform: (p.platform || 'twitter') as any,
      status: (p.status as any) || 'draft',
      scheduledTime: p.scheduledAt,
      engagement: (p.engagement as any) || { likes: 0, shares: 0, comments: 0, retweets: 0, replies: 0 },
      source: (p.metadata as any)?.source || undefined,
      metadata: p.metadata,
    }));
  }, [posts]);

  const update = async (id: string, updates: Partial<ContentPost>) => {
    try {
      const res = await fetch(`/api/content-posts/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const resp = await res.json();
      await fetchScheduled();
      return { data: (resp as any)?.data as ContentPost, error: null } as const;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      return { error } as const;
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/content-posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await fetchScheduled();
      return { error: null } as const;
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      return { error } as const;
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  return {
    items,
    loading,
    refetch: fetchScheduled,
    update,
    remove,
  };
}
