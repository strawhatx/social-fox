import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { oauthService } from '@/services/oauth/service';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
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

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing OAuth callback...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;