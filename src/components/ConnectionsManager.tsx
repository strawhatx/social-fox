import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Trash2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<Record<string, any>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateConnection = async () => {
    if (!selectedIntegration) return;
    
    const { error } = await createConnection(selectedIntegration, connectionConfig);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create connection",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Connection created successfully",
      });
      setDialogOpen(false);
      setSelectedIntegration('');
      setConnectionConfig({});
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
        return '📊';
      case 'gmail':
        return '📧';
      case 'github':
        return '🐙';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      default:
        return '🔗';
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connections</h2>
          <p className="text-muted-foreground">
            Manage third-party service connections for your project
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Connection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration">Integration</Label>
                <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations
                      .filter(integration => !getConnectionByIntegration(integration.id))
                      .map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          <div className="flex items-center gap-2">
                            <span>{getIntegrationIcon(integration.provider)}</span>
                            {integration.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedIntegration && (
                <div>
                  <Label htmlFor="account-identifier">Account Identifier (optional)</Label>
                  <Input
                    id="account-identifier"
                    placeholder="e.g., username, email, or account name"
                    value={connectionConfig.account_identifier || ''}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      account_identifier: e.target.value
                    })}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConnection} disabled={!selectedIntegration}>
                  Create Connection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.map((connection) => {
          const integration = integrations.find(i => i.id === connection.integration_id);
          if (!integration) return null;

          return (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getIntegrationIcon(integration.provider)}</span>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      {connection.account_identifier && (
                        <p className="text-sm text-muted-foreground">
                          {connection.account_identifier}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(connection.is_active)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Connected {new Date(connection.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteConnection(connection.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {connections.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Connect third-party services to enable content distribution and automation
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Connection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Available Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration) => {
            const hasConnection = getConnectionByIntegration(integration.id);
            
            return (
              <Card key={integration.id} className={hasConnection ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getIntegrationIcon(integration.provider)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.provider}</p>
                    </div>
                    {hasConnection && (
                      <Badge variant="secondary" className="text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsManager;