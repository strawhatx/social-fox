import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { Project, useProjects } from '@/hooks/useProjects';

const CreateProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createProject } = useProjects();

  // Platforms are fixed to Twitter and LinkedIn by default
  const defaultPlatforms = ['Twitter', 'LinkedIn'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const selectedPlatforms = defaultPlatforms;

    const projectData: Partial<Project> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      platforms: selectedPlatforms,
      brand_voice: formData.get('brandVoice') as string,
      target_audience: formData.get('targetAudience') as string,
      
    };

    const result = await createProject(projectData);
    
    if (result) {
      setOpen(false);
      e.currentTarget.reset();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Marketing Project</DialogTitle>
          <DialogDescription>
            Set up a new AI-powered marketing project with your preferred platforms and agents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="My Marketing Campaign" 
                required 
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe your marketing project..."
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="brandVoice">Brand Voice</Label>
              <Input 
                id="brandVoice" 
                name="brandVoice" 
                placeholder="Professional, friendly, innovative..."
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input 
                id="targetAudience" 
                name="targetAudience" 
                placeholder="Tech professionals, startups, marketing managers..."
                disabled={loading}
              />
            </div>

            {/* Platforms are fixed; no selection UI */}
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;