import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ProjectDashboard from '@/components/ProjectDashboard';
import { Project as DatabaseProject } from '@/hooks/useProjects';

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSelectProject = (dbProject: DatabaseProject) => {
    navigate(`/project/${dbProject.id}`);
  };

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