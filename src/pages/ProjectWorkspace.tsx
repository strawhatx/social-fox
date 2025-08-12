import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { LogOut, Twitter } from 'lucide-react';
import ProjectWorkspace from '@/components/ProjectWorkspace';
import { convertDbProjectToLegacy } from '@/types/project';
import { Loader2 } from 'lucide-react';

const ProjectWorkspacePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { projects, loading, updateProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!loading && projectId && projects.length > 0) {
      const dbProject = projects.find(p => p.id === projectId);
      if (dbProject) {
        const legacyProject = convertDbProjectToLegacy(dbProject);
        setSelectedProject(legacyProject);
      } else {
        // Project not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [projectId, projects, loading, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleProjectUpdate = async (updates: Partial<any>) => {
    if (projectId && updateProject) {
      try {
        await updateProject(projectId, updates);
        // Update the local state to reflect changes immediately
        setSelectedProject(prev => prev ? { ...prev, ...updates } : null);
      } catch (error) {
        console.error('Failed to update project:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading project...</span>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={handleBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://twitter.com/heynathanielj"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter: @heynathanielj"
            >
              <Twitter className="h-4 w-4 text-brand-orange" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="p-6">
        <ProjectWorkspace
          project={selectedProject}
          onBack={handleBack}
          onProjectUpdate={handleProjectUpdate}
        />
      </div>
    </div>
  );
};

export default ProjectWorkspacePage;