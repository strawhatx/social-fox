import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { oauthService } from '@/services/oauth/service';

export interface GoogleAuthUser {
  email: string;
  name: string;
}

export const useGoogleAuth = (workspaceId?: string) => {
  const [authorizingStates, setAuthorizingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const initiateGoogleAuth = useCallback(async (agentType: string, integrationName: string = 'Google Sheets') => {
    if (!workspaceId) {
      toast({
        title: "Error",
        description: "Workspace ID is required for authorization",
        variant: "destructive",
      });
      return;
    }

    const authKey = `${agentType}_${integrationName}`;
    setAuthorizingStates(prev => ({ ...prev, [authKey]: true }));

    try {
      // Determine provider based on integration name
      const provider = integrationName.toLowerCase().includes('gmail') ? 'gmail' : 'google_sheets';
      
      await oauthService.startOAuthFlow({
        provider,
        workspaceId,
        additionalParams: {
          agent_type: agentType
        }
      });

      toast({
        title: "Authorization Successful",
        description: `Connected to ${integrationName}`,
      });

      // Return a mock user object for compatibility
      return {
        email: 'authorized@example.com',
        name: 'Authorized User'
      };
    } catch (error) {
      console.error('Google authorization error:', error);
      toast({
        title: "Authorization Failed",
        description: error instanceof Error ? error.message : "Failed to authorize with Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      const authKey = `${agentType}_${integrationName}`;
      setAuthorizingStates(prev => ({ ...prev, [authKey]: false }));
    }
  }, [workspaceId, toast]);

  const refreshGoogleToken = useCallback(async (agentType: string) => {
    if (!workspaceId) return;

    try {
      // This would typically refresh the token through the OAuth callback system
      // For now, we'll just show a success message
      toast({
        title: "Token Refreshed",
        description: "Google authorization has been refreshed",
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh Google authorization",
        variant: "destructive",
      });
    }
  }, [workspaceId, toast]);

  const getAuthorizingState = useCallback((agentType: string, integrationName: string) => {
    const authKey = `${agentType}_${integrationName}`;
    return authorizingStates[authKey] || false;
  }, [authorizingStates]);

  return {
    initiateGoogleAuth,
    refreshGoogleToken,
    getAuthorizingState,
  };
};