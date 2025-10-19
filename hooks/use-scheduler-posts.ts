import { useEffect, useMemo, useState } from 'react';
import { ContentPost } from '@/lib/types/content_posts';


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

  const fetchScheduledFor = async (month: number, year: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      const res = await fetch(`/api/content-posts?${params.toString()}`);
      const body = await res.json();
      const data = (body?.data as ContentPost[]) || [];
      setPosts(data);
    } catch (error) {
      console.error('Error fetching scheduler posts for month:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const items: ContentPost[] = useMemo(() => {
    return posts.map((p) => ({
      id: p.id,
      userId: p.userId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      platform: (p.platform || 'twitter') as any,
      status: p.status || 'draft',
      scheduledAt: p.scheduledAt,
      postedAt: p.postedAt,
      items: p.items,
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
    refetchForMonthYear: fetchScheduledFor,
    update,
    remove,
  };
}
