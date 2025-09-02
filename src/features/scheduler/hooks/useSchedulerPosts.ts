import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withAsync } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type ContentPost = Tables<'content_posts'>;

export type SchedulerItem = {
  id: string;
  content: string;
  platform: 'twitter' | 'x' | string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  scheduledTime: string | null;
  engagement: { likes?: number; shares?: number; comments?: number; retweets?: number; replies?: number } | null;
  source?: 'commit' | 'ai' | 'conversation' | string;
};

export function useSchedulerPosts(workspaceId?: string | null) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    if (!user || !workspaceId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resp, err] = await withAsync(
        supabase
          .from('content_posts')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('scheduled_at', { ascending: true })
      );
      if (err) throw err;
      const data = (resp as any)?.data as ContentPost[] | null;
      setPosts(data || []);
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
      scheduledTime: p.scheduled_at,
      engagement: (p.engagement as any) || { likes: p.twitter_likes || 0, retweets: p.twitter_retweets || 0, replies: p.twitter_replies || 0 },
      source: (p.metadata as any)?.source || undefined,
    }));
  }, [posts]);

  const update = async (id: string, updates: Partial<ContentPost>) => {
    try {
      const [resp, err] = await withAsync(
        supabase.from('content_posts').update(updates).eq('id', id).select().single()
      );
      if (err) throw err;
      await fetchScheduled();
      return { data: (resp as any)?.data as ContentPost, error: null };
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      return { error };
    }
  };

  const remove = async (id: string) => {
    try {
      const [, err] = await withAsync(
        supabase.from('content_posts').delete().eq('id', id)
      );
      if (err) throw err;
      await fetchScheduled();
      return { error: null };
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, [user, workspaceId]);

  return {
    items,
    loading,
    refetch: fetchScheduled,
    update,
    remove,
  };
}
