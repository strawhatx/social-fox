import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GoogleAuthUser {
  email: string;
  name: string;
}

export const useGoogleAuth = (projectId?: string) => {
  const [authorizingStates, setAuthorizingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const initiateGoogleAuth = useCallback(async (agentType: string, integrationName: string = 'Google Sheets') => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required for authorization",
        variant: "destructive",
      });
      return;
    }

    const authKey = `${agentType}_${integrationName}`;
    setAuthorizingStates(prev => ({ ...prev, [authKey]: true }));

    try {
      // Call edge function to get auth URL
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { 
          projectId, 
          agentType, 
          integrationName 
        }
      });

      if (error) throw error;

      // Open popup window for OAuth
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for the popup to complete
      return new Promise<GoogleAuthUser>((resolve, reject) => {
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.success) {
            window.removeEventListener('message', messageListener);
            popup?.close();
            toast({
              title: "Authorization Successful",
              description: `Connected to Google account: ${event.data.userEmail}`,
            });
            resolve({
              email: event.data.userEmail,
              name: event.data.userName
            });
          } else if (event.data.error) {
            window.removeEventListener('message', messageListener);
            popup?.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authorization cancelled'));
          }
        }, 1000);
      });

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
  }, [projectId, toast]);

  const refreshGoogleToken = useCallback(async (agentType: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase.functions.invoke('google-oauth/refresh', {
        body: { projectId, agentType }
      });

      if (error) throw error;

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
  }, [projectId, toast]);

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