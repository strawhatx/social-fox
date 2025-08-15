import { useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { oauthService } from '@/services/oauth/service';
import { OauthCallbackStrategyFactory } from '@/strategy/oauth';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { provider } =useParams()
  const navigate = useNavigate();

  useEffect(() => {
    const strategy = OauthCallbackStrategyFactory.getStrategy(provider);
    strategy.handleCallback(searchParams, navigate);
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