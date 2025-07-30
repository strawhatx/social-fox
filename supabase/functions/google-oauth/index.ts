import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle OAuth initiation
    if (req.method === 'POST' && (url.pathname === '/google-oauth/initiate' || url.pathname === '/')) {
      const { projectId, agentType, integrationName } = await req.json();
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      // Get integration config
      const { data: integration } = await supabaseClient
        .from('integrations')
        .select('config_data')
        .eq('name', integrationName)
        .single();

      if (!integration) {
        throw new Error('Integration not found');
      }

      const config = integration.config_data as any;
      const scopes = config.scopes.join(' ');
      const state = btoa(JSON.stringify({ projectId, agentType, integrationName }));

      const authUrl = new URL(config.auth_url);
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', config.redirect_url);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scopes);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle OAuth callback
    if (req.method === 'GET' && url.pathname === '/google-oauth/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        return new Response(`
          <html>
            <body>
              <script>
                window.opener?.postMessage({ error: '${error}' }, '*');
                window.close();
              </script>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      }

      if (!code || !state) {
        throw new Error('Missing code or state parameter');
      }

      const { projectId, agentType, integrationName } = JSON.parse(atob(state));
      
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      
      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      // Get integration config for token URL
      const { data: integration } = await supabaseClient
        .from('integrations')
        .select('config_data')
        .eq('name', integrationName)
        .single();

      const config = integration.config_data as any;

      // Exchange code for tokens
      const tokenResponse = await fetch(config.token_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirect_url,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokens);
        throw new Error('Failed to exchange code for tokens');
      }

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      const userInfo = await userInfoResponse.json();

      // Store OAuth configuration
      const oauthConfig = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        scope: tokens.scope,
        user_email: userInfo.email,
        user_name: userInfo.name,
        authorized_at: new Date().toISOString(),
      };

      await supabaseClient
        .from('agent_configs')
        .upsert({
          project_id: projectId,
          agent_type: agentType,
          config_type: 'oauth',
          config_data: oauthConfig,
        }, {
          onConflict: 'project_id,agent_type,config_type'
        });

      console.log(`OAuth authorization successful for ${userInfo.email}`);

      return new Response(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ 
                success: true, 
                userEmail: '${userInfo.email}',
                userName: '${userInfo.name}'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // Handle token refresh
    if (req.method === 'POST' && url.pathname === '/google-oauth/refresh') {
      const { projectId, agentType } = await req.json();
      
      // Get current OAuth config
      const { data: agentConfig } = await supabaseClient
        .from('agent_configs')
        .select('config_data')
        .eq('project_id', projectId)
        .eq('agent_type', agentType)
        .eq('config_type', 'oauth')
        .single();

      if (!agentConfig) {
        throw new Error('OAuth configuration not found');
      }

      const currentConfig = agentConfig.config_data as any;
      
      if (!currentConfig.refresh_token) {
        throw new Error('No refresh token available');
      }

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

      // Refresh the access token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          refresh_token: currentConfig.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await refreshResponse.json();

      if (!refreshResponse.ok) {
        console.error('Token refresh error:', tokens);
        throw new Error('Failed to refresh token');
      }

      // Update stored configuration
      const updatedConfig = {
        ...currentConfig,
        access_token: tokens.access_token,
        expires_at: Date.now() + (tokens.expires_in * 1000),
        refreshed_at: new Date().toISOString(),
      };

      await supabaseClient
        .from('agent_configs')
        .update({ config_data: updatedConfig })
        .eq('project_id', projectId)
        .eq('agent_type', agentType)
        .eq('config_type', 'oauth');

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});