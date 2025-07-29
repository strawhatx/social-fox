import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ProjectDashboard from '@/components/ProjectDashboard';
import ProjectWorkspace from '@/components/ProjectWorkspace';
import { Project as DatabaseProject } from '@/hooks/useProjects';
import { Project, convertDbProjectToLegacy } from '@/types/project';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { signOut, user } = useAuth();

  const handleSelectProject = (dbProject: DatabaseProject) => {
    const legacyProject = convertDbProjectToLegacy(dbProject);
    setSelectedProject(legacyProject);
  };

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Marketing Agent Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
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
            onBack={() => setSelectedProject(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketing Agent Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
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
        <ProjectDashboard onSelectProject={handleSelectProject} />
      </div>
    </div>
  );
};

export default Index;