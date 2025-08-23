import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/hooks/useProjects';

const Step4Confirm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { updateProject, projects } = useProjects();
  const [styleNote, setStyleNote] = useState('Professional with technical depth');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<{
    brandVoice: string;
    targetAudience: string;
  }>({ brandVoice: '', targetAudience: '' });

  useEffect(() => {
    if (projectId) {
      const existingProject = projects.find(p => p.id === projectId);
      if (existingProject) {
        setProjectData({
          brandVoice: existingProject.brand_voice || '',
          targetAudience: existingProject.target_audience || '',
        });
      }
    }
  }, [projectId, projects]);

  const handleNext = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Optionally persist any style note if you add a column later; for now, keep status update
      await updateProject(projectId, { status: 'draft' as any } as any);
      navigate(`/create-project/${projectId}/finalize`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Writing Style</CardTitle>
        <CardDescription>
          Confirm how you want Social Fox to write your posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-secondary rounded-lg">
          <h4 className="font-medium mb-2">Your AI Writing Profile:</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Voice:</strong> {projectData.brandVoice}</li>
            <li><strong>Audience:</strong> {projectData.targetAudience}</li>
            <li><strong>Style:</strong> {styleNote}</li>
          </ul>
        </div>
        <Textarea value={styleNote} onChange={(e) => setStyleNote(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={isLoading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step4Confirm;


