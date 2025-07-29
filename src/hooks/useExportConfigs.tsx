import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ExportConfig {
  id: string;
  project_id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useExportConfigs = (projectId?: string) => {
  const [configs, setConfigs] = useState<ExportConfig[]>([]);
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
        .from('export_configs')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setConfigs((data || []) as ExportConfig[]);
    } catch (error) {
      console.error('Error fetching export configs:', error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const upsertConfig = async (name: string, configData: Partial<ExportConfig>) => {
    if (!user || !projectId) return { error: 'User not authenticated or no project ID' };

    try {
      const { data, error } = await supabase
        .from('export_configs')
        .upsert({
          project_id: projectId,
          name,
          type: configData.type || 'webhook',
          enabled: configData.enabled ?? false,
          config: configData.config || {}
        }, {
          onConflict: 'project_id,name'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConfigs();
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting export config:', error);
      return { error };
    }
  };

  const deleteConfig = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('export_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigs();
      return { error: null };
    } catch (error) {
      console.error('Error deleting export config:', error);
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