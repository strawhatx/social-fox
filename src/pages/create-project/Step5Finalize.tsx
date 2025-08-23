import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';

const Step5Finalize = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { updateProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      try {
        await supabase.functions.invoke('init-github-content', { body: { project_id: projectId } });
      } catch (e) {
        console.warn('init-github-content failed or not configured:', e);
      }
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
        <div className="flex justify-end">
          <Button onClick={handleFinish} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step5Finalize;
