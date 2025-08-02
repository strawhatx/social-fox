import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitBranch, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useOAuth } from '@/hooks/useOAuth';
import { useToast } from '@/hooks/use-toast';
import { useConnections } from '@/hooks/useConnections';

interface GitHubConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isConnected?: boolean;
  onConnectionSuccess?: () => void;
}

export const GitHubConnectionDialog = ({ 
  isOpen, 
  onClose, 
  projectId, 
  isConnected = false,
  onConnectionSuccess 
}: GitHubConnectionDialogProps) => {
  const [step, setStep] = useState<'connect' | 'configure'>(isConnected ? 'configure' : 'connect');
  const [owner, setOwner] = useState('');
  const [repository, setRepository] = useState('');

  const { connectProvider, isConnecting } = useOAuth();
  const { toast } = useToast();
  const { createConnection, updateConnection, getIntegrationByProvider, getConnectionByIntegration } = useConnections(projectId);

  // Load existing connection data
  useEffect(() => {
    if (isConnected && isOpen) {
      const githubIntegration = getIntegrationByProvider('github');
      if (githubIntegration) {
        const connection = getConnectionByIntegration(githubIntegration.id);
        if (connection?.account_config?.repository) {
          setOwner(connection.account_config.repository.owner || '');
          setRepository(connection.account_config.repository.repository || '');
        }
      }
    }
  }, [isConnected, isOpen, getIntegrationByProvider, getConnectionByIntegration]);

  // Reset step when dialog opens/closes or connection status changes
  useEffect(() => {
    if (isOpen) {
      setStep(isConnected ? 'configure' : 'connect');
    } else {
      // Reset form when dialog closes
      setOwner('');
      setRepository('');
    }
  }, [isOpen, isConnected]);

  const handleConnect = async () => {
    try {
      await connectProvider({
        provider: 'github',
        projectId,
        additionalParams: {
          scope: 'repo,user:email'
        }
      });

      // Wait for OAuth completion before moving to configure step
      // The OAuth service will handle the popup and callback
      
      toast({
        title: "GitHub connected successfully",
        description: "Now you can configure your repository settings",
      });

      // Move to configuration step after OAuth success
      setStep('configure');
      
      // Refresh connections data to get the latest OAuth info
      // This will be handled by the parent component calling onConnectionSuccess
    } catch (error) {
      console.error('GitHub connection failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub",
        variant: "destructive",
      });
    }
  };

  const handleSaveRepository = async () => {
    if (!owner.trim() || !repository.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both GitHub username and repository name",
        variant: "destructive",
      });
      return;
    }

    // Verify we have a valid GitHub connection with OAuth token
    const githubIntegration = getIntegrationByProvider('github');
    if (!githubIntegration) {
      toast({
        title: "GitHub not connected",
        description: "Please complete GitHub authorization first",
        variant: "destructive",
      });
      setStep('connect');
      return;
    }

    const existingConnection = getConnectionByIntegration(githubIntegration.id);
    if (!existingConnection?.account_config?.access_token) {
      toast({
        title: "GitHub authorization required",
        description: "Please complete GitHub authorization first",
        variant: "destructive",
      });
      setStep('connect');
      return;
    }
    try {
      const accountConfig = {
        ...existingConnection.account_config, // Preserve existing OAuth data
        repository: {
          owner: owner,
          owner_url: `https://github.com/${owner}`,
          repository: repository,
          repository_url: `https://github.com/${owner}/${repository}`
        }
      };

      // Update the existing connection with repository info
      await updateConnection(existingConnection.id, accountConfig);

      toast({
        title: "Success",
        description: "GitHub repository connected successfully",
      });

      onConnectionSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save repository:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save repository",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <DialogTitle>Connect GitHub</DialogTitle>
          </div>
          <DialogDescription>
            Connect your GitHub account to automatically sync your repository and track development progress.
          </DialogDescription>
        </DialogHeader>

        {step === 'connect' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <GitBranch className="w-8 h-8" />
                <div>
                  <h3 className="font-semibold">GitHub Repository</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn commits into progress updates
                  </p>
                </div>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
                {isConnected ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Automatic content generation from commit messages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Real-time development progress tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Integration with your existing workflow</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Re-authorize' : 'Connect GitHub'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-medium">GitHub Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Now specify which repository to track
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner">GitHub Account</Label>
                <Input
                  id="owner"
                  placeholder="e.g., account username"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repopository">Repository</Label>
                <Input
                  id="repository"
                  placeholder="e.g., my-awesome-project"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <strong>Repository URL:</strong> {
                  owner && repository
                    ? `https://github.com/${owner}/${repository}` 
                    : owner || repository
                      ? `https://github.com/${owner || '[owner]'}/${repository || '[repository]'}` 
                      : 'Enter GitHub URL and repository name above'
                }
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setStep('connect')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSaveRepository}
                disabled={!owner.trim() || !repository.trim()}
                className="flex-1"
              >
                Save Repository
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};