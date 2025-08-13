import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Twitter, Zap } from 'lucide-react';
import ProjectDashboard from '@/components/ProjectDashboard';
import { Project as DatabaseProject } from '@/hooks/useProjects';

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSelectProject = (dbProject: DatabaseProject) => {
    navigate(`/project/${dbProject.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://twitter.com/heynathanielj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter: @heynathanielj"
              >
                <Twitter className="h-4 w-4 text-orange-500 fill-orange-500" />
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

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