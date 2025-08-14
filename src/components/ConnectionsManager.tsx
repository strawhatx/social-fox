import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2, ExternalLink, Check, AlertCircle, Database, Share2, GitBranch, FileSpreadsheet, Twitter, Linkedin } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';
import { useOAuth } from '@/hooks/useOAuth';
import { GitHubConnectionDialog } from './GitHubConnectionDialog';


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
  automation_enabled?: boolean;
  automation_frequency?: string;
}

interface ConnectionsManagerProps {
  project: Project;
  onProjectUpdate?: (updates: Partial<Project>) => void;
}

const availablePlatforms = [
  'LinkedIn', 'Twitter'
];

const ConnectionsManager = ({ project, onProjectUpdate }: ConnectionsManagerProps) => {
  const [showGitHubDialog, setShowGitHubDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    brandVoice: project.brandVoice,
    targetAudience: project.targetAudience,
    platforms: project.platforms,
    automation_enabled: project.automation_enabled || false,
    automation_frequency: project.automation_frequency || 'daily'
  });
  
  const { 
    connections, 
    integrations, 
    loading, 
    createConnection, 
    updateConnection, 
    deleteConnection,
    getConnectionByIntegration,
    refetch 
  } = useConnections(project.id);
  
  const { toast } = useToast();
  const { connectProvider, isConnecting } = useOAuth();

  const handleConnectIntegration = async (integration: any) => {
    // Show GitHub dialog for GitHub connections
    if (integration.provider === 'github') {
      setShowGitHubDialog(true);
      return;
    }

    try {
      await connectProvider({
        provider: integration.provider,
        projectId: project.id
      });

      // The connection will be created automatically by the OAuth callback
      // No need to create it manually here
      toast({
        title: "Success",
        description: `${integration.name} connected successfully`,
      });
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to the service",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    const { error } = await deleteConnection(connectionId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Connection deleted successfully",
      });
    }
  };

  const getIntegrationIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google_sheets':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'github':
        return <GitBranch className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getProviderDescription = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google_sheets':
        return 'Manual task updates → post ideas';
      case 'github':
        return 'Turn commits into progress updates';
      case 'twitter':
        return 'Publish updates and threads';
      case 'linkedin':
        return 'Professional updates and articles';
      default:
        return 'Connect to enable automation';
    }
  };

  const dataSourceIntegrations = integrations.filter(integration => 
    integration.type === 'data_source'
  );

  const publishingPlatformIntegrations = integrations.filter(integration => 
    integration.type === 'publishing_platform'
  );

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"} className="flex items-center gap-1">
        {isActive ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {isActive ? 'Connected' : 'Inactive'}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading connections...</div>;
  }

  const renderConnectionCard = (integration: any) => {
    const connection = getConnectionByIntegration(integration.id);
    const isConnected = !!connection;

    return (
      <Card key={integration.id} className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getIntegrationIcon(integration.provider)}
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <Badge variant={isConnected ? "default" : "secondary"} className="mt-1">
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-3 mb-4">
          {getProviderDescription(integration.provider)}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {integration.type === 'data_source' ? "Data Source" : "Publishing Platform"}
          </span>
          
          {isConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleConnectIntegration(integration)}
              disabled={isConnecting}
            >
              Re-authorize
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={() => handleConnectIntegration(integration)}
              disabled={isConnecting}
            >
              Connect →
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const handleProjectUpdate = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    if (onProjectUpdate) {
      onProjectUpdate(formData);
      toast({
        title: "Success",
        description: "Project settings updated successfully"
      });
    }
  };

  // Platforms are display-only; editing disabled

  const githubIntegration = integrations.find(integration => integration.provider === 'github');
  const githubConnection = githubIntegration ? getConnectionByIntegration(githubIntegration.id) : null;

  return (
    <>
      <div className="space-y-8">
        {/* Project Settings Section */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-6">Project Settings</h2>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice</Label>
                <Input
                  id="brandVoice"
                  value={formData.brandVoice}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandVoice: e.target.value }))}
                  placeholder="e.g., Professional, Casual, Friendly"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                placeholder="Describe your target audience"
              />
            </div>

            {/* Platforms (display-only) */}
            <div className="space-y-4">
              <Label>Platforms</Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.platforms.map((platform) => (
                    <Badge
                      key={platform}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Automation Settings */}
            <div className="space-y-4">
              <Label>Automation Settings</Label>
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="automation-toggle">Auto-generate posts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create draft posts based on connected data sources
                    </p>
                  </div>
                  <Switch
                    id="automation-toggle"
                    checked={formData.automation_enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        automation_enabled: checked,
                        automation_frequency: 'daily'
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleProjectUpdate} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-orange-foreground">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
        {/* How It Works Section */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How It Works</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Pull Data</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>AI Processing</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Content</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Auto-Post</span>
            </div>
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Data Sources</h2>
              <span className="text-sm text-muted-foreground">Pull real-time data</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSourceIntegrations.map(renderConnectionCard)}
            
            {/* Request More Integration Card */}
            <Card className="p-6 border-dashed">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Need another source?</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a new data source integration
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://twitter.com/heynathanielj', '_blank')}
                  className="w-full"
                >
                  Request Integration
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Publishing Platforms Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Publishing Platforms</h2>
              <span className="text-sm text-muted-foreground">Share your content</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publishingPlatformIntegrations.map(renderConnectionCard)}
            
            {/* Request More Integration Card */}
            <Card className="p-6 border-dashed">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Need another platform?</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a new publishing platform
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://twitter.com/heynathanielj', '_blank')}
                  className="w-full"
                >
                  Request Platform
                </Button>
              </div>
            </Card>
          </div>
        </div>

      </div>

      <GitHubConnectionDialog
        isOpen={showGitHubDialog}
        onClose={() => setShowGitHubDialog(false)}
        projectId={project.id}
        isConnected={!!githubConnection}
        onConnectionSuccess={() => {
          // Refresh connections data without a full reload
          refetch();
          setShowGitHubDialog(false);
        }}
      />
    </>
  );
};

export default ConnectionsManager;