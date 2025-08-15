import { oauthService } from "@/services/oauth/service";

// Strategy pattern for rendering connection fields
interface OauthCallbackStrategy {
    handleCallback(searchParams: URLSearchParams, navigate: (path: string) => void): Promise<void>
}

class TwitterCallbackStrategy implements OauthCallbackStrategy {
    async handleCallback(searchParams: URLSearchParams, navigate: (path: string) => void) {
        const oauth_token = searchParams.get('oauth_token');
        const oauth_verifier = searchParams.get('oauth_verifier');
        console.log('oauth_token', oauth_token);
        console.log('oauth_verifier', oauth_verifier); 
  
        if (!oauth_token || !oauth_verifier) {
          const errorMsg = 'Missing oauth token or oauth verifier';
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              error: errorMsg
            }, window.location.origin);
            window.close();
            return;
          }
          navigate('/dashboard');
          return;
        }
  
        try {   
          const result = await oauthService.handleCallback({
            oauth_token,
            oauth_verifier,
            provider: 'twitter',
          });
  
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              data: result
            }, window.location.origin);
            window.close();
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              error: error instanceof Error ? error.message : 'OAuth callback failed'
            }, window.location.origin);
            window.close();
          } else {
            navigate('/dashboard');
          }
        }
      };
}

class DefaultCallbackStrategy implements OauthCallbackStrategy {
    async handleCallback(searchParams: URLSearchParams, navigate: (path: string) => void) {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
  
        if (error) {
          // Send error message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              error: searchParams.get('error_description') || error
            }, window.location.origin);
            window.close();
            return;
          }
          navigate('/dashboard');
          return;
        }
  
        if (!code || !state) {
          const errorMsg = 'Missing authorization code or state parameter';
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              error: errorMsg
            }, window.location.origin);
            window.close();
            return;
          }
          navigate('/dashboard');
          return;
        }
  
        try {
          // Parse state to get provider and project info
          const stateData = JSON.parse(atob(state));
          
          const result = await oauthService.handleCallback({
            code,
            state,
            provider: stateData.provider,
            projectId: stateData.project_id || stateData.team_id
          });
  
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_success',
              data: result
            }, window.location.origin);
            window.close();
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth_error',
              error: error instanceof Error ? error.message : 'OAuth callback failed'
            }, window.location.origin);
            window.close();
          } else {
            navigate('/dashboard');
          }
        }
      };
}

export class OauthCallbackStrategyFactory {
    static getStrategy(provider: string): OauthCallbackStrategy {
        // Only google and spradsheet like apps use file field
        switch (provider) {
            case "twitter":
                return new TwitterCallbackStrategy();
            default:
                return new DefaultCallbackStrategy();
        }
    }
}
