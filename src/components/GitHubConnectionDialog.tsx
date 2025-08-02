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
  const [owner, setOwner] = useState('');
  const [repository, setRepository] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { connectProvider, isConnecting } = useOAuth();
  const { toast } = useToast();
  const { createConnection, updateConnection, getIntegrationByProvider, getConnectionByIntegration } = useConnections(projectId);

  // Load existing connection data
  useEffect(() => {
    if (isOpen) {
      const githubIntegration = getIntegrationByProvider('github');
      if (githubIntegration) {
        const connection = getConnectionByIntegration(githubIntegration.id);
        if (connection?.account_config?.repository) {
          setOwner(connection.account_config.repository.owner || '');
          setRepository(connection.account_config.repository.repository || '');
        }
      }
    } else {
      // Reset form when dialog closes
      setOwner('');
      setRepository('');
    }
  }, [isOpen, getIntegrationByProvider, getConnectionByIntegration]);

  const handleAuthorizeAndSave = async () => {
    if (!owner.trim() || !repository.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both GitHub username and repository name",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, authorize GitHub
      await connectProvider({
        provider: 'github',
        projectId,
        additionalParams: {
          scope: 'repo,user:email'
        }
      });

      // After OAuth success, save the repository
      const githubIntegration = getIntegrationByProvider('github');
      if (!githubIntegration) {
        throw new Error('GitHub integration not found after authorization');
      }

      const connection = getConnectionByIntegration(githubIntegration.id);
      if (!connection?.account_config?.access_token) {
        throw new Error('GitHub authorization failed - no access token received');
      }

      const accountConfig = {
        ...connection.account_config,
        repository: {
          owner: owner,
          owner_url: `https://github.com/${owner}`,
          repository: repository,
          repository_url: `https://github.com/${owner}/${repository}`
        }
      };

      await updateConnection(connection.id, accountConfig);

      toast({
        title: "Success",
        description: "GitHub repository connected successfully",
      });

      onConnectionSuccess?.();
      onClose();
    } catch (error) {
      console.error('GitHub authorization and save failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to authorize and save repository",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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

        <div className="space-y-6">
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
              <Label htmlFor="repository">Repository</Label>
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
                    : 'Enter GitHub username and repository name above'
              }
            </div>
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
              onClick={handleAuthorizeAndSave}
              disabled={!owner.trim() || !repository.trim() || isProcessing || isConnecting}
              className="flex-1"
            >
              {isProcessing || isConnecting ? 'Authorizing...' : 'Authorize & Save'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};