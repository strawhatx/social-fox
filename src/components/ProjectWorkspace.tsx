import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Settings, Play, Download, Link, Edit2, Check, X } from 'lucide-react';
import ContentFeed from './ContentFeed';
import ConnectionsManager from './ConnectionsManager';
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [editedDescription, setEditedDescription] = useState(project.description);
  const { posts } = useContentPosts(project.id);
  const { connections } = useConnections(project.id);
  
  const activeConnectionsCount = connections?.length || 0;
  const generatedCount = posts?.length || 0;
  const exportedCount = posts?.filter(post => post.status === 'posted')?.length || 0;

  const handleSaveName = () => {
    if (onProjectUpdate && editedName.trim() !== project.name) {
      onProjectUpdate({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveDescription = () => {
    if (onProjectUpdate && editedDescription.trim() !== project.description) {
      onProjectUpdate({ description: editedDescription.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleCancelNameEdit = () => {
    setEditedName(project.name);
    setIsEditingName(false);
  };

  const handleCancelDescriptionEdit = () => {
    setEditedDescription(project.description);
    setIsEditingDescription(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
          <div className="flex-1 max-w-2xl">
            {/* Project Name */}
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelNameEdit();
                    }}
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleSaveName}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelNameEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Project Description */}
            <div className="mt-1">
              {isEditingDescription ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="text-muted-foreground border-none shadow-none p-0 bg-transparent focus-visible:ring-0 min-h-[1.5rem] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                      if (e.key === 'Escape') handleCancelDescriptionEdit();
                    }}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1 mt-1">
                    <Button size="sm" variant="ghost" onClick={handleSaveDescription}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelDescriptionEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  <p className="text-muted-foreground">{project.description}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingDescription(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-[-2px]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {project.status}
          </Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </div>

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