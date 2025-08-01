import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Settings, Play, Download, Link } from 'lucide-react';
import ContentFeed from './ContentFeed';
import ConnectionsManager from './ConnectionsManager';
import ProjectSettingsDialog from './ProjectSettingsDialog';
import { useContentPosts } from '@/hooks/useContentPosts';
import { useConnections } from '@/hooks/useConnections';

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
}

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

export default function ProjectWorkspace({ project, onBack, onProjectUpdate }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [showSettings, setShowSettings] = useState(false);
  const { posts } = useContentPosts(project.id);
  const { connections } = useConnections(project.id);
  
  const activeConnectionsCount = connections?.length || 0;
  const generatedCount = posts?.length || 0;
  const exportedCount = posts?.filter(post => post.status === 'posted')?.length || 0;

  return (
    <div className="space-y-6">{/* Project Workspace Container */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {project.status}
          </Badge>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <ProjectSettingsDialog
        project={project}
        open={showSettings}
        onOpenChange={setShowSettings}
        onUpdate={(updates) => {
          if (onProjectUpdate) {
            onProjectUpdate(updates);
          }
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Link className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">{activeConnectionsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated</p>
                <p className="text-2xl font-bold">{generatedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{exportedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Content Feed</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <ContentFeed project={project} />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <ConnectionsManager project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}