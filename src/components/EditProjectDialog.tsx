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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Project, useProjects } from '@/hooks/useProjects';

interface EditProjectDialogProps {
  project: Project;
  trigger: React.ReactNode;
}

const EditProjectDialog = ({ project, trigger }: EditProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateProject, deleteProject } = useProjects();

  const platforms = [
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  ];

  // Roles removed from schema/UI

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const selectedPlatforms = platforms
      .filter(platform => formData.get(`platform_${platform.id}`))
      .map(platform => platform.name);

    const updates: Partial<Project> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      platforms: selectedPlatforms,
      brand_voice: formData.get('brandVoice') as string,
      target_audience: formData.get('targetAudience') as string,
    };

    await updateProject(project.id, updates);
    setOpen(false);
    setLoading(false);
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.name}</DialogTitle>
          <DialogDescription>
            Update your marketing project settings, platforms, and AI agents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={project.name}
                required 
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                name="description" 
                defaultValue={project.description}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="edit-brandVoice">Brand Voice</Label>
              <Input 
                id="edit-brandVoice" 
                name="brandVoice" 
                defaultValue={project.brand_voice}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="edit-targetAudience">Target Audience</Label>
              <Input 
                id="edit-targetAudience" 
                name="targetAudience" 
                defaultValue={project.target_audience}
                disabled={loading}
              />
            </div>

            <div>
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`edit_platform_${platform.id}`} 
                      name={`platform_${platform.id}`}
                      defaultChecked={project.platforms.includes(platform.name)}
                      disabled={loading}
                    />
                    <Label 
                      htmlFor={`edit_platform_${platform.id}`} 
                      className="flex items-center space-x-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span>{platform.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles removed from schema */}
          </div>

          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    "{project.name}" and all its associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex space-x-2">
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
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;