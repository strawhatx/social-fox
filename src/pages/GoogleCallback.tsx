import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      window.opener?.postMessage({ error }, '*');
      window.close();
      return;
    }

    if (code && state) {
      // Redirect to the unified OAuth callback
      window.location.href = `/oauth/callback?code=${code}&state=${state}`;
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Processing authorization...</h2>
        <p className="text-muted-foreground">Please wait while we complete the setup.</p>
      </div>
    </div>
  );
}