import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Settings, Loader2, Edit, Zap, Twitter } from 'lucide-react';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { Project, useProjects } from '@/hooks/useProjects';
import { useSubscription } from '@/hooks/useSubscription';

interface ProjectDashboardProps {
  onSelectProject: (project: Project) => void;
}

export default function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  const { projects, loading, refetch } = useProjects();
  const { subscription } = useSubscription();

  console.log('ProjectDashboard: projects loaded:', projects);
  console.log('ProjectDashboard: loading state:', loading);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LinkedIn': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Instagram': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Facebook': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'YouTube': return 'bg-red-100 text-red-800 border-red-200';
      case 'TikTok': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {projects.length === 0 && <CreateProjectDialog onCreated={() => refetch()} />}
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="card-modern p-16 text-center">
          <div className="space-y-6">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
              <p className="text-gray-600 text-lg">Create your first marketing project to get started with AI-powered content generation</p>
            </div>
            <CreateProjectDialog onCreated={() => refetch()} />
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Your project{projects.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              {subscription?.subscription_plan === 'pro' ? (
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border-blue-200">
                  {projects.length}/3 Projects (Pro)
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gradient-to-r from-orange-50 to-blue-50 text-gray-700 border-orange-200">
                  {projects.length}/1 Project (Free)
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="card-modern relative overflow-hidden cursor-pointer group border-0"
                onClick={() => onSelectProject(project)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl font-bold line-clamp-1">{project.name}</CardTitle>
                      <p className="text-gray-600 line-clamp-2">{project.description || 'No description'}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4 mr-2 text-orange-500" />
                      {project.platforms.length} platforms connected
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      Target: {project.target_audience || 'Not specified'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(project.created_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Brand Voice</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {project.brand_voice || 'Not specified'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Platforms ({project.platforms.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {project.platforms.length > 0 ? (
                        project.platforms.slice(0, 3).map((platform) => (
                          <Badge 
                            key={platform} 
                            variant="outline"
                            className={`text-xs rounded-full ${getPlatformColor(platform)}`}
                          >
                            {platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No platforms selected</span>
                      )}
                      {project.platforms.length > 3 && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          +{project.platforms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                    >
                      Open Workspace
                    </Button>
                    <EditProjectDialog 
                      project={project}
                      trigger={
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}