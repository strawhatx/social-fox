import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, ExternalLink, Check, AlertCircle, Database, Share2, GitBranch, Mail, FileSpreadsheet, Twitter, Linkedin } from 'lucide-react';
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
}

interface ConnectionsManagerProps {
  project: Project;
}

const ConnectionsManager = ({ project }: ConnectionsManagerProps) => {
  const { 
    connections, 
    integrations, 
    loading, 
    createConnection, 
    updateConnection, 
    deleteConnection,
    getConnectionByIntegration 
  } = useConnections(project.id);
  
  const { toast } = useToast();
  const { connectProvider, isConnecting } = useOAuth();
  const [gitHubDialogOpen, setGitHubDialogOpen] = useState(false);
  const [selectedGitHubIntegration, setSelectedGitHubIntegration] = useState<string>('');

  const handleConnectIntegration = async (integration: any) => {
    if (integration.provider === 'github') {
      setSelectedGitHubIntegration(integration.id);
      setGitHubDialogOpen(true);
      return;
    }

    try {
      await connectProvider({
        provider: integration.provider,
        projectId: project.id
      });

      // Create a basic connection for non-GitHub integrations
      const { error } = await createConnection(integration.id, {});
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create connection",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${integration.name} connected successfully`,
        });
      }
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
      case 'gmail':
        return <Mail className="w-5 h-5" />;
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
      case 'gmail':
        return 'Surface insights from conversations';
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
              onClick={() => handleDeleteConnection(connection.id)}
            >
              Disconnect
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

  return (
    <div className="space-y-8">
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
          
          {/* Request Integration Card */}
          <Card className="p-6 border-2 border-dashed border-muted-foreground/25">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px]">
              <Plus className="w-6 h-6 text-muted-foreground mb-2" />
              <h3 className="font-semibold mb-1">Request Integration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Need another data source? Let us know!
              </p>
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
          
          {/* Request Platform Card */}
          <Card className="p-6 border-2 border-dashed border-muted-foreground/25">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[120px]">
              <Plus className="w-6 h-6 text-muted-foreground mb-2" />
              <h3 className="font-semibold mb-1">Request Platform</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Want to publish elsewhere? Let us know!
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* GitHub Connection Dialog */}
      <GitHubConnectionDialog
        open={gitHubDialogOpen}
        onOpenChange={setGitHubDialogOpen}
        projectId={project.id}
        integrationId={selectedGitHubIntegration}
      />
    </div>
  );
};

export default ConnectionsManager;