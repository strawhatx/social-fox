import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/components/ui/use-toast';

const Step5Finalize = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { updateProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { hasCredits, loading: subscriptionLoading } = useSubscription();

  const REQUIRED_CREDITS_FOR_INIT = 3;

  const handleGenerate = async () => {
    if (!projectId) return;
    // Validate credits before starting workflow
    if (subscriptionLoading) return; // wait until subscription data is ready
    if (!hasCredits(REQUIRED_CREDITS_FOR_INIT)) {
      toast({
        title: 'Insufficient credits',
        description: `You need at least ${REQUIRED_CREDITS_FOR_INIT} credits to generate initial content. Upgrade your plan or add credits in Settings.`,
      });
      return;
    }
    setIsLoading(true);
    setProgress(0);
    try {
      // Resolve GitHub connection id via projects_with_connections view
      const { data: projectRow, error: projectConnectionsError } = await supabase
        .from('projects_with_connections')
        .select('connections')
        .eq('project_id', projectId)
        .single();

      if (projectConnectionsError) {
        console.error('Failed to load project connections', projectConnectionsError);
        return;
      }

      const connections = (projectRow?.connections as any[]) || [];
      const githubConnection = connections.find((c: any) => c.provider === 'github' && c.status === 'connected');
      if (!githubConnection?.connection_id) {
        console.error('No connected GitHub connection found for project');
        return;
      }

      // Start workflow and progress animation in parallel
      let jobDone = false;
      let baselineDone = false;

      const workflowPromise = supabase.functions
        .invoke('init-github-content', {
          body: { project_id: projectId, connection_id: githubConnection.connection_id },
        })
        .then(({ error }) => {
          if (error) throw error;
        })
        .finally(() => {
          jobDone = true;
        });

      const targetBeforeComplete = 95;
      const durationMs = 60000; // ~1 minute to reach ~95%
      const tickMs = 500;
      const start = Date.now();

      let intervalId: any;
      const baselinePromise = new Promise<void>((resolve) => {
        intervalId = setInterval(() => {
          const elapsed = Date.now() - start;
          const base = Math.min(targetBeforeComplete, Math.floor((elapsed / durationMs) * targetBeforeComplete));
          setProgress((prev) => (prev < base ? base : prev));

          if (elapsed >= durationMs) {
            baselineDone = true;
            if (jobDone) {
              clearInterval(intervalId);
              resolve();
            }
          }
        }, tickMs);
      });

      // Wait for both the job and the baseline animation
      await Promise.all([
        workflowPromise.catch((e) => {
          console.error('Failed to start or complete generation', e);
          throw e;
        }),
        baselinePromise,
      ]);

      // Ensure 100% is shown once both are done
      setProgress(100);
      if (intervalId) clearInterval(intervalId);

      // Refresh content and finalize
      await supabase
        .from('content_posts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      await updateProject(projectId, { status: 'initialized' } as any);
      navigate(`/project/${projectId}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          Ready to Generate!
        </CardTitle>
        <CardDescription>
          Your project is configured and ready. Social Fox will now generate initial draft posts based on your settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-primary/10 rounded-lg">
          <h4 className="font-medium mb-2">What happens next:</h4>
          <ul className="space-y-1 text-sm">
            <li>• Initial drafts will be generated from your repository</li>
            <li>• You can review and edit posts before scheduling</li>
            <li>• Connect Twitter, LinkedIn, and other platforms</li>
            <li>• Future posts are automatically drafted from new commits</li>
          </ul>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground text-center">{progress}%</div>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button onClick={handleGenerate} disabled={isLoading || !hasCredits(REQUIRED_CREDITS_FOR_INIT)}>
            {isLoading ? 'Generating…' : 'Generate'}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step5Finalize;
