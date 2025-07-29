import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PlatformConfig {
  id: string;
  project_id: string;
  platform: string;
  enabled: boolean;
  character_limit?: number | null;
  template?: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const usePlatformConfigs = (projectId?: string) => {
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConfigs = async () => {
    if (!user || !projectId) {
      setConfigs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setConfigs((data || []) as PlatformConfig[]);
    } catch (error) {
      console.error('Error fetching platform configs:', error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const upsertConfig = async (platform: string, configData: Partial<PlatformConfig>) => {
    if (!user || !projectId) return { error: 'User not authenticated or no project ID' };

    try {
      const { data, error } = await supabase
        .from('platform_configs')
        .upsert({
          project_id: projectId,
          platform,
          enabled: configData.enabled ?? true,
          character_limit: configData.character_limit,
          template: configData.template,
          config: configData.config || {}
        }, {
          onConflict: 'project_id,platform'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConfigs();
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting platform config:', error);
      return { error };
    }
  };

  const deleteConfig = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('platform_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigs();
      return { error: null };
    } catch (error) {
      console.error('Error deleting platform config:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [user, projectId]);

  return {
    configs,
    loading,
    upsertConfig,
    deleteConfig,
    refetch: fetchConfigs,
  };
};