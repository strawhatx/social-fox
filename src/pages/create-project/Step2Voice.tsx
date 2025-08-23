import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const Step2Voice = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { updateProject, projects } = useProjects();
  const [brandVoice, setBrandVoice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const existingProject = projects.find(p => p.id === projectId);
      if (existingProject) {
        setBrandVoice(existingProject.brand_voice || '');
        setTargetAudience(existingProject.target_audience || '');
      }
    }
  }, [projectId, projects]);

  const handleNext = async () => {
    if (!projectId) return;
    if (!brandVoice.trim() || !targetAudience.trim()) return;
    setIsLoading(true);
    try {
      await updateProject(projectId, {
        brand_voice: brandVoice,
        target_audience: targetAudience,
        status: 'draft' as any,
      } as any);
      navigate(`/create-project/${projectId}/github`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Voice & Audience</CardTitle>
        <CardDescription>
          How should Social Fox sound? Who are you trying to reach?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Brand Voice</label>
          <Textarea
            placeholder="Professional and friendly, with technical expertise..."
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Target Audience</label>
          <Textarea
            placeholder="Developers, startup founders, tech enthusiasts..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={!brandVoice.trim() || !targetAudience.trim() || isLoading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step2Voice;


