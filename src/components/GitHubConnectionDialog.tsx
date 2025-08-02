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
  // If already connected, start with configure step, otherwise start with connect
  const [step, setStep] = useState<'connect' | 'configure'>(isConnected ? 'configure' : 'connect');
  const [owner, setOwner] = useState('');
  const [repository, setRepository] = useState('');
  
  const { connectProvider, isConnecting } = useOAuth();
  const { toast } = useToast();
  const { createConnection, updateConnection, getIntegrationByProvider, getConnectionByIntegration } = useConnections(projectId);

  // Reset step when dialog opens/closes or connection status changes
  useEffect(() => {
    if (isOpen) {
      setStep(isConnected ? 'configure' : 'connect');
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

      // Move to configuration step after OAuth success
      setStep('configure');
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
        description: "Please enter both GitHub URL and repository name",
        variant: "destructive",
      });
      return;
    }

    try {
      const githubIntegration = getIntegrationByProvider('github');
      if (!githubIntegration) {
        throw new Error('GitHub integration not found');
      }
 
      const accountConfig = {
        repository:{
          owner: owner,
          owner_url: `https://github.com/${owner}`,
          repository: repository,
          repository_url: `https://github.com/${owner}/${repository}`
        }
      };

      // Check if connection already exists
      const existingConnection = getConnectionByIntegration(githubIntegration.id);
      
      if (existingConnection) {
        // Update existing connection
        await updateConnection(existingConnection.id, accountConfig);
      } else {
        // Create new connection
        await createConnection(githubIntegration.id, accountConfig);
      }

      toast({
        title: "Success",
        description: "GitHub repository connected successfully",
      });

      onConnectionSuccess?.();
      onClose();
      setStep('connect');
        setOwner('');
        setRepository('');
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
                  value={gitUrl}
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
                  owner && repoository
                    ? `https://github.com/${owner}/${repository}` 
                    : owner || repsitory
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
                disabled={!gitUrl.trim() || !repoName.trim()}
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