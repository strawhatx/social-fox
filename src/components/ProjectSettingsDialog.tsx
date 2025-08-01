import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
  brandVoice: string;
  targetAudience: string;
}

interface ProjectSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<Project>) => void;
}

const availablePlatforms = [
  'LinkedIn', 'Twitter', 'Facebook', 'Instagram', 
  'YouTube', 'TikTok', 'Medium', 'Slack'
];

export default function ProjectSettingsDialog({ 
  project, 
  open, 
  onOpenChange, 
  onUpdate 
}: ProjectSettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    brandVoice: project.brandVoice,
    targetAudience: project.targetAudience,
    platforms: project.platforms
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    onUpdate(formData);
    onOpenChange(false);
    toast({
      title: "Success",
      description: "Project settings updated successfully"
    });
  };

  const addPlatform = (platform: string) => {
    if (!formData.platforms.includes(platform)) {
      setFormData(prev => ({
        ...prev,
        platforms: [...prev.platforms, platform]
      }));
    }
  };

  const removePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p !== platform)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Update your project configuration and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'paused' | 'draft') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Brand Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandVoice">Brand Voice</Label>
              <Input
                id="brandVoice"
                value={formData.brandVoice}
                onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))}
                placeholder="e.g., Professional, Casual, Friendly"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Describe your target audience"
              />
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-4">
            <Label>Platforms</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.platforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {platform}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removePlatform(platform)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <Select onValueChange={addPlatform}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add platform" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms
                    .filter(platform => !formData.platforms.includes(platform))
                    .map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}