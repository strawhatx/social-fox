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
            repositories: [],
            recent_activity: []
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the first GitHub connection
    const githubConnection = connections[0];
    const accountConfig = githubConnection.account_config;

    // Extract GitHub data from the stored OAuth tokens
    let githubData = {
      description: 'GitHub connected successfully',
      repositories: [],
      recent_activity: []
    };

    if (accountConfig?.access_token) {
      // If we have an access token, we could fetch real GitHub data
      // For now, we'll return the stored account information
      githubData = {
        description: `GitHub account connected${accountConfig.login ? ` (${accountConfig.login})` : ''}`,
        repositories: accountConfig.repositories || [],
        recent_activity: ['Recent commits and activity available'],
        login: accountConfig.login
      };
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