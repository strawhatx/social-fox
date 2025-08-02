import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  automation_enabled?: boolean;
  automation_frequency?: string;
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
    platforms: project.platforms,
    automation_enabled: project.automation_enabled || false,
    automation_frequency: project.automation_frequency || 'daily'
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Update your project configuration and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
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

          {/* Automation Settings */}
          <div className="space-y-4">
            <Label>Automation Settings</Label>
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="automation-toggle">Auto-generate posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create draft posts based on GitHub activity
                  </p>
                </div>
                <Switch
                  id="automation-toggle"
                  checked={formData.automation_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, automation_enabled: checked }))
                  }
                />
              </div>
              
              {formData.automation_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Check frequency</Label>
                  <Select
                    value={formData.automation_frequency}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, automation_frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
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