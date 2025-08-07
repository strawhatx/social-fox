import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Connection {
  id: string;
  project_id: string;
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

export const useConnections = (projectId?: string) => {
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
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('*')
        .eq('is_active', true);

      if (integrationsError) throw integrationsError;
      
      // Adapt data to match our interface (handle legacy config_data -> config_public)
      const adaptedIntegrations = (integrationsData || []).map((integration: any) => ({
        ...integration,
        config_public: integration.config_public || integration.config_data || {}
      }));
      
      setIntegrations(adaptedIntegrations as Integration[]);

      // Fetch connections for the project if projectId is provided
      if (projectId) {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true);

        if (connectionsError) throw connectionsError;
        setConnections((connectionsData || []) as Connection[]);
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
    if (!user || !projectId) return { error: 'User not authenticated or no project ID' };

    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          project_id: projectId,
          integration_id: integrationId,
          config_public: configPublic,
          secrets: secrets
        })
        .select()
        .single();

      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('connections')
        .update(updateData)
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      
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
  }, [user, projectId]);

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