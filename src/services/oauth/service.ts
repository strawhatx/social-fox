import { supabase } from '@/integrations/supabase/client';

export interface OAuthConfig {
  provider: string;
  projectId: string;
  additionalParams?: Record<string, string>;
}

export class OAuthService {
  async initiateOAuth(config: OAuthConfig): Promise<string> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('process-oauth', {
        body: {
          project_id: config.projectId,
          provider: config.provider,
          user_id: user.id,
          ...config.additionalParams
        }
      });

      if (error) {
        throw new Error(`Failed to initiate OAuth: ${error.message}`);
      }

      return data as string;
    } catch (error) {
      console.error('OAuth initiation error:', error);
      throw error;
    }
  }

  async handleCallback(params: {
    code: string;
    state: string;
    provider: string;
    projectId: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('oauth-callback', {
        body: {
          code: params.code,
          state: params.state,
          provider: params.provider,
          project_id: params.projectId,
          params: {}
        }
      });

      if (error) {
        throw new Error(`OAuth callback failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  async startOAuthFlow(config: OAuthConfig): Promise<void> {
    try {
      const authUrl = await this.initiateOAuth(config);
      
      // Open popup window
      const popup = window.open(
        authUrl,
        'oauth_popup',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the popup to close or send a message
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('OAuth flow was cancelled'));
          }
        }, 1000);

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'oauth_success') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            resolve(event.data.data);
          } else if (event.data.type === 'oauth_error') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (error) {
      console.error('OAuth flow error:', error);
      throw error;
    }
  }
}

export const oauthService = new OAuthService();