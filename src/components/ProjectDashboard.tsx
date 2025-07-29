import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Zap, Settings, Loader2, Edit } from 'lucide-react';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { Project, useProjects } from '@/hooks/useProjects';

interface ProjectDashboardProps {
  onSelectProject: (project: Project) => void;
}

export default function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  const { projects, loading } = useProjects();

  console.log('ProjectDashboard: projects loaded:', projects);
  console.log('ProjectDashboard: loading state:', loading);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LinkedIn': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Instagram': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Facebook': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'YouTube': return 'bg-red-100 text-red-800 border-red-200';
      case 'TikTok': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatLastGenerated = (lastGenerated: string | null) => {
    if (!lastGenerated) return 'Never';
    
    const date = new Date(lastGenerated);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
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
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Marketing Agent Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered content generation for multiple projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-4xl">🚀</div>
            <div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-muted-foreground">Create your first marketing project to get started with AI-powered content generation</p>
            </div>
            <CreateProjectDialog />
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {projects.filter(p => p.status === 'active').length} Active
              </Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {projects.filter(p => p.status === 'paused').length} Paused
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                {projects.filter(p => p.status === 'draft').length} Draft
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20"
                onClick={() => onSelectProject(project)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {Object.values(project.roles).filter(Boolean).length} active AI agents
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 mr-2" />
                      Last generated: {formatLastGenerated(project.last_generated)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {formatDate(project.created_at)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Brand Voice</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.brand_voice || 'Not specified'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Platforms ({project.platforms.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {project.platforms.length > 0 ? (
                        project.platforms.slice(0, 3).map((platform) => (
                          <Badge 
                            key={platform} 
                            variant="outline"
                            className={`text-xs ${getPlatformColor(platform)}`}
                          >
                            {platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No platforms selected</span>
                      )}
                      {project.platforms.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.platforms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="secondary" 
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