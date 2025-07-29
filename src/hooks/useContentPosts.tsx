import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ContentPost {
  id: string;
  project_id: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  scheduled_at?: string | null;
  posted_at?: string | null;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useContentPosts = (projectId?: string) => {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    if (!user || !projectId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as ContentPost[]);
    } catch (error) {
      console.error('Error fetching content posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: { content: string; platform: string; status?: 'draft' | 'scheduled' | 'posted' | 'archived' }) => {
    if (!user || !projectId) return { error: 'User not authenticated or no project ID' };

    try {
      const { data, error } = await supabase
        .from('content_posts')
        .insert({
          content: postData.content,
          platform: postData.platform,
          status: postData.status || 'draft',
          project_id: projectId,
          engagement: { likes: 0, shares: 0, comments: 0 },
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('content_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPosts();
      return { error: null };
    } catch (error) {
      console.error('Error deleting content post:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, projectId]);

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};