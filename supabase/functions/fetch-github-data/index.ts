import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching GitHub data for project: ${projectId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get GitHub connections for this project
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select(`
        account_config,
        integrations!inner(provider)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .eq('integrations.provider', 'github');

    if (connectionsError) {
      console.error('Error fetching GitHub connections:', connectionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch GitHub connections' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!connections || connections.length === 0) {
      return new Response(
         JSON.stringify({ 
           data: { 
             description: 'No GitHub connection found. Connect GitHub to get real-time data.',
             commits: [],
             tickets: [],
             comments: []
           } 
         }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the first GitHub connection
    const githubConnection = connections[0];
    const accountConfig = githubConnection.account_config;

    // Call the n8n webhook to get real GitHub data
    let githubData = {
      description: 'GitHub connected successfully',
      commits: [],
      tickets: [],
      comments: 0
    };

    if (accountConfig?.access_token) {
      try {
        console.log('Making request to n8n webhook with data:', {
          projectId,
          githubLogin: accountConfig.login,
          hasToken: !!accountConfig.access_token
        });

        // Get n8n credentials from Supabase secrets
        const n8nUsername = Deno.env.get('8N8_USERNAME');
        const n8nPassword = Deno.env.get('8N8_PASSWORD');
        
        if (!n8nUsername || !n8nPassword) {
          console.error('n8n credentials not found in environment variables');
          throw new Error('n8n credentials not configured');
        }

        // Make request to n8n webhook using GET with query parameters and basic auth
        const webhookUrl = new URL('https://primary-production-146e9.up.railway.app/webhook/github-data');
        webhookUrl.searchParams.set('projectId', projectId);
        webhookUrl.searchParams.set('githubToken', accountConfig.access_token);
        if (accountConfig.login) {
          webhookUrl.searchParams.set('githubLogin', accountConfig.login);
        }

        const credentials = btoa(`${n8nUsername}:${n8nPassword}`);
        const webhookResponse = await fetch(webhookUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${credentials}`
          }
        });

        console.log('n8n webhook response status:', webhookResponse.status);
        
        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          console.log('n8n webhook response data:', webhookData);
          
          // Ensure we have the expected structure
          githubData = {
            description: webhookData.description || `GitHub account connected${accountConfig.login ? ` (${accountConfig.login})` : ''}`,
            commits: Array.isArray(webhookData.commits) ? webhookData.commits : [],
            tickets: Array.isArray(webhookData.tickets) ? webhookData.tickets : [],
            comments: typeof webhookData.comments === 'number' ? webhookData.comments : 0,
            login: accountConfig.login
          };
          console.log('Successfully processed data from n8n webhook:', githubData);
        } else {
          const errorText = await webhookResponse.text();
          console.warn('n8n webhook request failed with status:', webhookResponse.status, 'Error:', errorText);
          githubData = {
            description: `GitHub account connected${accountConfig.login ? ` (${accountConfig.login})` : ''}`,
            commits: [],
            tickets: [],
            comments: 0,
            login: accountConfig.login
          };
        }
      } catch (error) {
        console.error('Error calling n8n webhook:', error);
        // Fallback to stored account information
        githubData = {
          description: `GitHub account connected${accountConfig.login ? ` (${accountConfig.login})` : ''}`,
          commits: [],
          tickets: [],
          comments: 0,
          login: accountConfig.login
        };
      }
    }

    console.log('GitHub data retrieved successfully');

    return new Response(
      JSON.stringify({ data: githubData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-github-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});