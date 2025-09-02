import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withAsync } from '@/lib/utils';
import { useAuth } from './useAuth';

export interface Connection {
  id: string;
  workspace_id: string;
  integration_id: string;
  config_public: Record<string, any>;
  secrets?: Record<string, any>;
  account_identifier: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string | null;
  icon: string | null;
  config_public: Record<string, any>;
  secrets?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useConnections = (workspaceId?: string) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setConnections([]);
      setIntegrations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch integrations
      const [integrationsResp, integrationsErr] = await withAsync(
        supabase.from('integrations').select('*').eq('is_active', true)
      );
      if (integrationsErr) throw integrationsErr;
      const integrationsData = (integrationsResp as any)?.data;
      
      // Adapt data to match our interface (handle legacy config_data -> config_public)
      const adaptedIntegrations = (integrationsData || []).map((integration: any) => ({
        ...integration,
        config_public: integration.config_public || integration.config_data || {}
      }));
      
      setIntegrations(adaptedIntegrations as Integration[]);

      // Fetch connections for the workspace if workspaceId is provided
      if (workspaceId) {
        const [connectionsResp, connectionsErr] = await withAsync(
          supabase.from('connections').select('*').eq('workspace_id', workspaceId).eq('is_active', true)
        );
        if (connectionsErr) throw connectionsErr;
        setConnections((((connectionsResp as any)?.data) || []) as Connection[]);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Error fetching connections/integrations:', error);
      setConnections([]);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (
    integrationId: string,
    configPublic: Record<string, any>,
    secrets?: Record<string, any>
  ) => {
    if (!user || !workspaceId) return { error: 'User not authenticated or no workspace ID' };

    try {
      const [insertResp, insertErr] = await withAsync(
        supabase
          .from('connections')
          .insert({
            workspace_id: workspaceId,
            integration_id: integrationId,
            config_public: configPublic,
            secrets: secrets
          })
          .select()
          .single()
      );
      if (insertErr) throw insertErr;
      const data = (insertResp as any)?.data;
      
      await fetchData();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating connection:', error);
      return { error };
    }
  };

  const updateConnection = async (
    connectionId: string,
    configPublic?: Record<string, any>,
    secrets?: Record<string, any>
  ) => {
    if (!user) return { error: 'User not authenticated' };

    const updateData: any = {};
    if (configPublic !== undefined) updateData.config_public = configPublic;
    if (secrets !== undefined) updateData.secrets = secrets;

    try {
      const [updateResp, updateErr] = await withAsync(
        supabase.from('connections').update(updateData).eq('id', connectionId).select().single()
      );
      if (updateErr) throw updateErr;
      const data = (updateResp as any)?.data;
      
      await fetchData();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating connection:', error);
      return { error };
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const [, delErr] = await withAsync(
        supabase.from('connections').delete().eq('id', connectionId)
      );
      if (delErr) throw delErr;
      
      await fetchData();
      return { error: null };
    } catch (error) {
      console.error('Error deleting connection:', error);
      return { error };
    }
  };

  const getConnectionByIntegration = (integrationId: string): Connection | undefined => {
    return connections.find(connection => connection.integration_id === integrationId);
  };

  const getIntegrationByProvider = (provider: string): Integration | undefined => {
    return integrations.find(integration => integration.provider === provider);
  };

  useEffect(() => {
    fetchData();
  }, [user, workspaceId]);

  return {
    connections,
    integrations,
    loading,
    createConnection,
    updateConnection,
    deleteConnection,
    getConnectionByIntegration,
    getIntegrationByProvider,
    refetch: fetchData,
  };
};