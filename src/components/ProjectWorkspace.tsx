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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">Project Workspace</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
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

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Marketing Agent Dashboard */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Marketing Agent Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Brand Voice:</span>
                  <span className="text-muted-foreground">{project.brandVoice}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Target Audience:</span>
                  <span className="text-muted-foreground">{project.targetAudience}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Connections</p>
                  <p className="text-2xl font-bold">{activeConnectionsCount}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Link className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Generated</p>
                  <p className="text-2xl font-bold">{generatedCount}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{exportedCount}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-fit">
            <TabsTrigger value="feed">Content Feed</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <ContentFeed project={project} />
          </TabsContent>

          <TabsContent value="connections">
            <ConnectionsManager project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}