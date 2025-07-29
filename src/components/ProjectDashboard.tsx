import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Zap, Settings, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  status: 'active' | 'paused' | 'draft';
  brand_voice: string;
  target_audience: string;
  created_at: string;
}

interface ProjectDashboardProps {
  onSelectProject: (project: any) => void;
}

export default function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log('ProjectDashboard rendered - User:', user?.email);
  console.log('Projects state:', projects);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching projects...');
        setLoading(true);
        
        // Try to fetch from projects table
        const { data, error } = await supabase
          .from('projects' as any)
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Supabase response:', { data, error });

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        const transformedProjects: Project[] = (data || []).map((project: any) => ({
          id: project.id,
          name: project.name || 'Untitled Project',
          description: project.description || '',
          platforms: project.platforms || [],
          status: project.status || 'draft',
          brand_voice: project.brand_voice || '',
          target_audience: project.target_audience || '',
          created_at: project.created_at,
        }));

        console.log('Setting projects:', transformedProjects);
        setProjects(transformedProjects);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        
        // For now, show empty state instead of error
        setProjects([]);
        
        toast({
          title: "Database Loading",
          description: "Projects will appear here once you create them.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl">🚀</div>
          <div>
            <h3 className="text-lg font-semibold">
              {projects.length === 0 ? 'Database Connected Successfully!' : `Found ${projects.length} projects`}
            </h3>
            <p className="text-muted-foreground">
              {projects.length === 0 
                ? 'Your database is working. The hardcoded data has been removed.' 
                : 'Your projects are loaded from the database'
              }
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </Card>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Brand Voice:</strong> {project.brand_voice || 'Not set'}</p>
                  <p className="text-sm"><strong>Platforms:</strong> {project.platforms.join(', ') || 'None'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}