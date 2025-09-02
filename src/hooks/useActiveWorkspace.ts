import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withAsync } from '@/lib/utils';
import { useAuth } from './useAuth';

export function useActiveWorkspace() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveWorkspace = async () => {
    if (!user) {
      setWorkspaceId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resp, err] = await withAsync(
        supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
      );
      if (err) throw err;
      const data = (resp as any)?.data as { id: string } | null;
      setWorkspaceId(data?.id || null);
    } catch (error) {
      console.error('Error fetching active workspace:', error);
      setWorkspaceId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveWorkspace();
  }, [user]);

  return { workspaceId, loading, refetch: fetchActiveWorkspace };
}


