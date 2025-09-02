import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withAsync } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type ContentPost = Tables<'content_posts'>;

export const useContentPosts = (workspaceId?: string) => {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user || !workspaceId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resp, err] = await withAsync(
        supabase.from('content_posts').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
      );
      if (err) throw err;
      const data = (resp as any)?.data;
      setPosts(((data || []) as unknown) as ContentPost[]);
    } catch (error) {
      console.error('Error fetching content posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: { content: string; platform: string; status?: 'draft' | 'scheduled' | 'posted' | 'archived' }) => {
    if (!user || !workspaceId) return { error: 'User not authenticated or no workspace ID' };

    try {
      const [insertResp, insertErr] = await withAsync(
        supabase
          .from('content_posts')
          .insert({
            content: postData.content,
            platform: postData.platform,
            status: postData.status || 'draft',
            workspace_id: workspaceId,
            engagement: { likes: 0, shares: 0, comments: 0 } as any,
            metadata: {} as any
          })
          .select()
          .single()
      );
      if (insertErr) throw insertErr;
      const data = (insertResp as any)?.data;
      
      await fetchPosts();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating content post:', error);
      return { error };
    }
  };

  const updatePost = async (id: string, updates: Partial<ContentPost>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const [updateResp, updateErr] = await withAsync(
        supabase.from('content_posts').update(updates).eq('id', id).select().single()
      );
      if (updateErr) throw updateErr;
      const data = (updateResp as any)?.data;
      
      await fetchPosts();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating content post:', error);
      return { error };
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const [, delErr] = await withAsync(
        supabase.from('content_posts').delete().eq('id', id)
      );
      if (delErr) throw delErr;
      
      await fetchPosts();
      return { error: null };
    } catch (error) {
      console.error('Error deleting content post:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, workspaceId]);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};