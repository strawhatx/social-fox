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
             comments: 0
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
        // Make request to n8n webhook
        const webhookResponse = await fetch('https://primary-production-146e9.up.railway.app/webhook/github-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId,
            githubToken: accountConfig.access_token,
            githubLogin: accountConfig.login
          })
        });

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          githubData = webhookData;
          console.log('Successfully fetched data from n8n webhook');
        } else {
          console.warn('n8n webhook request failed, falling back to stored data');
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