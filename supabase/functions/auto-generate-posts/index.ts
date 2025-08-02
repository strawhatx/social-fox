import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting automated post generation...');

    // Get projects with automation enabled
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('automation_enabled', true);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    console.log(`Found ${projects?.length || 0} projects with automation enabled`);

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No projects with automation enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const project of projects) {
      try {
        console.log(`Processing project: ${project.name} (${project.id})`);

        // Check if project has active GitHub connections
        const { data: connections, error: connectionsError } = await supabase
          .from('connections')
          .select('*')
          .eq('project_id', project.id)
          .eq('is_active', true);

        if (connectionsError) {
          console.error(`Error fetching connections for project ${project.id}:`, connectionsError);
          continue;
        }

        const githubConnection = connections?.find(conn => 
          conn.account_config?.provider === 'github'
        );

        if (!githubConnection) {
          console.log(`No active GitHub connection found for project ${project.id}`);
          continue;
        }

        // Fetch GitHub data
        const githubResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-github-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId: project.id }),
        });

        if (!githubResponse.ok) {
          console.error(`Failed to fetch GitHub data for project ${project.id}`);
          continue;
        }

        const githubData = await githubResponse.json();
        console.log(`GitHub data fetched for project ${project.id}:`, githubData);

        // Check if there's new activity since last generation
        const hasNewActivity = githubData.commits?.length > 0 || githubData.tickets?.length > 0;

        if (!hasNewActivity) {
          console.log(`No new activity found for project ${project.id}`);
          continue;
        }

        // Generate content for each configured platform
        const platforms = ['Twitter', 'LinkedIn']; // Default platforms
        
        for (const platform of platforms) {
          const template = getTemplateForPlatform(platform, project);
          const content = buildContentFromGitHubData(githubData, project);

          if (!content) {
            console.log(`No content to generate for project ${project.id}, platform ${platform}`);
            continue;
          }

          // Generate post using OpenAI
          const openAIResponse = await fetch(`${supabaseUrl}/functions/v1/generate-content`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              template,
              platform,
            }),
          });

          if (!openAIResponse.ok) {
            console.error(`Failed to generate content for project ${project.id}, platform ${platform}`);
            continue;
          }

          const generatedData = await openAIResponse.json();

          // Create draft post
          const { data: post, error: postError } = await supabase
            .from('content_posts')
            .insert({
              project_id: project.id,
              platform,
              content: generatedData.generatedContent,
              status: 'draft',
              engagement: { likes: 0, shares: 0, comments: 0 },
              metadata: {
                automated: true,
                source: 'github',
                generated_at: new Date().toISOString(),
                source_data: githubData,
              },
            })
            .select()
            .single();

          if (postError) {
            console.error(`Error creating post for project ${project.id}:`, postError);
          } else {
            console.log(`Created automated post for project ${project.id}, platform ${platform}`);
            results.push({
              projectId: project.id,
              platform,
              postId: post.id,
              success: true,
            });
          }
        }

        // Update last_generated timestamp
        await supabase
          .from('projects')
          .update({ last_generated: new Date().toISOString() })
          .eq('id', project.id);

      } catch (error) {
        console.error(`Error processing project ${project.id}:`, error);
        results.push({
          projectId: project.id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log('Automated post generation completed:', results);

    return new Response(
      JSON.stringify({ 
        success: true,
        processedProjects: projects.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-generate-posts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getTemplateForPlatform(platform: string, project: any): string {
  const baseTemplates = {
    Twitter: `Create an engaging Twitter post about {{content}}. Keep it under 280 characters, use relevant hashtags, and make it shareable. Brand voice: ${project.brand_voice || 'professional'}`,
    LinkedIn: `Create a professional LinkedIn post about {{content}}. Focus on business value, include insights, and make it engaging for professionals. Brand voice: ${project.brand_voice || 'professional'}`,
  };

  return baseTemplates[platform] || baseTemplates.Twitter;
}

function buildContentFromGitHubData(githubData: any, project: any): string {
  const parts = [];

  // Add project context
  if (project.description) {
    parts.push(`Project: ${project.description}`);
  }

  // Add recent commits
  if (githubData.commits && githubData.commits.length > 0) {
    const recentCommits = githubData.commits.slice(0, 3);
    parts.push(`Recent development work:\n${recentCommits.map(commit => `- ${commit.message || commit.title}`).join('\n')}`);
  }

  // Add recent issues/tickets
  if (githubData.tickets && githubData.tickets.length > 0) {
    const recentTickets = githubData.tickets.slice(0, 2);
    parts.push(`Recent progress:\n${recentTickets.map(ticket => `- ${ticket.title}: ${ticket.state}`).join('\n')}`);
  }

  return parts.join('\n\n');
}