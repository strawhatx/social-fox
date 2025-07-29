import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, BarChart3, Zap } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
  roles: {
    brand_builder: boolean;
    content_creator: boolean;
    audience_researcher: boolean;
    campaign_planner: boolean;
    channel_manager: boolean;
    analytics_tracker: boolean;
    lead_generator: boolean;
    community_engager: boolean;
    growth_hacker: boolean;
  };
  brandVoice: string;
  targetAudience: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Syncflow',
    description: 'Workflow automation platform',
    platforms: ['Twitter', 'LinkedIn'],
    contentSources: 3,
    lastGenerated: '2 hours ago',
    status: 'active',
    roles: {
      brand_builder: true,
      content_creator: true,
      audience_researcher: false,
      campaign_planner: true,
      channel_manager: true,
      analytics_tracker: true,
      lead_generator: false,
      community_engager: true,
      growth_hacker: false,
    },
    brandVoice: 'Professional yet approachable',
    targetAudience: 'SaaS professionals and entrepreneurs'
  },
  {
    id: '2',
    name: 'ProductX',
    description: 'AI-powered analytics dashboard',
    platforms: ['Twitter', 'LinkedIn', 'Instagram'],
    contentSources: 2,
    lastGenerated: '1 day ago',
    status: 'active',
    roles: {
      brand_builder: true,
      content_creator: true,
      audience_researcher: true,
      campaign_planner: false,
      channel_manager: true,
      analytics_tracker: true,
      lead_generator: true,
      community_engager: false,
      growth_hacker: true,
    },
    brandVoice: 'Technical and data-driven',
    targetAudience: 'Data scientists and analysts'
  },
  {
    id: '3',
    name: 'AppY',
    description: 'Mobile development framework',
    platforms: ['LinkedIn'],
    contentSources: 1,
    lastGenerated: 'Never',
    status: 'draft',
    roles: {
      brand_builder: false,
      content_creator: true,
      audience_researcher: false,
      campaign_planner: false,
      channel_manager: false,
      analytics_tracker: false,
      lead_generator: false,
      community_engager: false,
      growth_hacker: false,
    },
    brandVoice: 'Developer-friendly and straightforward',
    targetAudience: 'Mobile app developers'
  }
];

interface ProjectDashboardProps {
  onSelectProject: (project: Project) => void;
}

export default function ProjectDashboard({ onSelectProject }: ProjectDashboardProps) {
  const [projects] = useState(mockProjects);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-twitter/10 text-twitter border-twitter/20';
      case 'LinkedIn': return 'bg-linkedin/10 text-linkedin border-linkedin/20';
      case 'Instagram': return 'bg-instagram/10 text-instagram border-instagram/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Marketing Agent
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => onSelectProject(project)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {Object.values(project.roles).filter(Boolean).length} active roles
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 mr-2" />
                  Last generated: {project.lastGenerated}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Brand Voice</p>
                <p className="text-xs text-muted-foreground">{project.brandVoice}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {project.platforms.map((platform) => (
                    <Badge 
                      key={platform} 
                      variant="outline"
                      className={getPlatformColor(platform)}
                    >
                      {platform}
                    </Badge>
                  ))}
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
                  Open
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}