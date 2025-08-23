import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

const Step1Basics = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, updateProject } = useProjects();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      // Load existing project data
      const existingProject = projects.find(p => p.id === projectId);
      if (existingProject) {
        setName(existingProject.name || '');
        setDescription(existingProject.description || '');
      }
    }
  }, [projectId, projects]);

  const handleNext = async () => {
    if (!name.trim() || !description.trim()) return;
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project ID found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateProject(projectId, { 
        name, 
        description, 
        status: 'draft' as any 
      } as any);
      
      navigate(`/create-project/${projectId}/brand`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Project Basics
        </CardTitle>
        <CardDescription>
          This helps Social Fox understand what your project is about and draft posts that fit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Project Name</label>
          <Input
            placeholder="My Awesome Project"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Project Description</label>
          <Textarea
            placeholder="A brief description of what your project does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={!name.trim() || !description.trim() || isLoading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Step1Basics;


