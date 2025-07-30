import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AgentConfig {
  id: string;
  project_id: string;
  agent_type: string;
  config_type: string;
  config_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useAgentConfigs = (projectId?: string) => {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
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
        .from('agent_configs')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setConfigs((data || []) as AgentConfig[]);
    } catch (error) {
      console.error('Error fetching agent configs:', error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const upsertConfig = async (
    agentType: string, 
    configType: string, 
    configData: Record<string, any>
  ) => {
    if (!user || !projectId) return { error: 'User not authenticated or no project ID' };

    try {
      const { data, error } = await supabase
        .from('agent_configs')
        .upsert({
          project_id: projectId,
          agent_type: agentType,
          config_type: configType,
          config_data: configData
        }, {
          onConflict: 'project_id,agent_type,config_type'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConfigs();
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting agent config:', error);
      return { error };
    }
  };

  const getConfig = (agentType: string, configType: string): AgentConfig | undefined => {
    return configs.find(config => 
      config.agent_type === agentType && config.config_type === configType
    );
  };

  const deleteConfig = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('agent_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchConfigs();
      return { error: null };
    } catch (error) {
      console.error('Error deleting agent config:', error);
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
    getConfig,
    deleteConfig,
    refetch: fetchConfigs,
  };
};