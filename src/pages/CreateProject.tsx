import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Github, Sparkles } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GitHubConnectionDialog } from '@/components/GitHubConnectionDialog';

interface ProjectData {
  name: string;
  description: string;
  brandVoice: string;
  targetAudience: string;
  githubRepo?: string;
}

const CreateProject = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    brandVoice: '',
    targetAudience: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  
  const navigate = useNavigate();
  const { createProject, projects } = useProjects();
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Check if user can create more projects
  const canCreateProject = () => {
    const maxProjects = subscription?.subscription_is_active ? 3 : 1;
    return projects.length < maxProjects;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateFreeSubscription = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.functions.invoke('create-free-subscription');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Free subscription created! You can now proceed.",
      });
    } catch (error: any) {
      console.error('Error creating free subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create free subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!canCreateProject()) {
      toast({
        title: "Project Limit Reached",
        description: "Please upgrade to create more projects.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const result = await createProject({
      name: projectData.name,
      description: projectData.description,
      brand_voice: projectData.brandVoice,
      target_audience: projectData.targetAudience,
      platforms: ['twitter', 'linkedin']
    });

    if (result?.id) {
      navigate(`/project/${result.id}`);
    }
    
    setIsLoading(false);
  };

  if (!canCreateProject() && !subscription?.subscription_is_active) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Project Limit Reached
            </CardTitle>
            <CardDescription>
              Free users can create 1 project. Upgrade to Pro for up to 3 projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateFreeSubscription}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Free Subscription"}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
                  value={projectData.name}
                  onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Project Description</label>
                <Textarea
                  placeholder="A brief description of what your project does..."
                  value={projectData.description}
                  onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
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
                  value={projectData.brandVoice}
                  onChange={(e) => setProjectData({...projectData, brandVoice: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Textarea
                  placeholder="Developers, startup founders, tech enthusiasts..."
                  value={projectData.targetAudience}
                  onChange={(e) => setProjectData({...projectData, targetAudience: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Connect GitHub Repository
              </CardTitle>
              <CardDescription>
                Connect your GitHub repo so Social Fox can automatically generate posts from your commits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowGitHubDialog(true)} className="w-full">
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub Repository
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                This is a one-time setup. After this, Social Fox will automatically generate drafts from your commits!
              </p>
            </CardContent>
          </Card>
        );

      case 4:
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
                  <li><strong>Style:</strong> Professional with technical depth</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                You can always adjust this later in your project settings.
              </p>
            </CardContent>
          </Card>
        );

      case 5:
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
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectData.name.trim() && projectData.description.trim();
      case 2:
        return projectData.brandVoice.trim() && projectData.targetAudience.trim();
      case 3:
        return true; // Can proceed without GitHub for now
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="mb-4" />
      </div>

      {renderStep()}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? () => navigate('/') : handleBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleFinish}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <GitHubConnectionDialog
        isOpen={showGitHubDialog}
        onClose={() => setShowGitHubDialog(false)}
        projectId=""
      />
    </div>
  );
};

export default CreateProject;