import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
  ];

  const roles = [
    { key: 'brand_builder', label: 'Brand Builder' },
    { key: 'content_creator', label: 'Content Creator' },
    { key: 'audience_researcher', label: 'Audience Researcher' },
    { key: 'campaign_planner', label: 'Campaign Planner' },
    { key: 'channel_manager', label: 'Channel Manager' },
    { key: 'analytics_tracker', label: 'Analytics Tracker' },
    { key: 'lead_generator', label: 'Lead Generator' },
    { key: 'community_engager', label: 'Community Engager' },
    { key: 'growth_hacker', label: 'Growth Hacker' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const selectedPlatforms = platforms
      .filter(platform => formData.get(`platform_${platform.id}`))
      .map(platform => platform.name);

    const selectedRoles = roles.reduce((acc, role) => {
      acc[role.key as keyof Project['roles']] = !!formData.get(`role_${role.key}`);
      return acc;
    }, {} as Project['roles']);

    const projectData: Partial<Project> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      platforms: selectedPlatforms,
      brand_voice: formData.get('brandVoice') as string,
      target_audience: formData.get('targetAudience') as string,
      roles: selectedRoles,
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

            <div>
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`platform_${platform.id}`} 
                      name={`platform_${platform.id}`}
                      disabled={loading}
                    />
                    <Label 
                      htmlFor={`platform_${platform.id}`} 
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span>{platform.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>AI Marketing Agents</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {roles.map((role) => (
                  <div key={role.key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`role_${role.key}`} 
                      name={`role_${role.key}`}
                      disabled={loading}
                    />
                    <Label htmlFor={`role_${role.key}`}>{role.label}</Label>
                  </div>
                ))}
              </div>
            </div>
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