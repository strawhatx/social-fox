import { useState } from 'react';
import { oauthService, OAuthConfig } from '@/services/oauth/service';
import { useToast } from '@/hooks/use-toast';

export interface UseOAuthResult {
  isConnecting: boolean;
  connectProvider: (config: OAuthConfig) => Promise<void>;
}

export const useOAuth = (): UseOAuthResult => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectProvider = async (config: OAuthConfig) => {
    setIsConnecting(true);
    
    try {
      await oauthService.startOAuthFlow(config);
      
      toast({
        title: "Successfully connected!",
        description: `${config.provider} has been connected to your project.`,
      });
    } catch (error) {
      console.error('OAuth connection failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to the service",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isConnecting,
    connectProvider,
  };
};