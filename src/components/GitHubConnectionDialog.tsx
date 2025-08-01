import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useConnections } from '@/hooks/useConnections';
import { useOAuth } from '@/hooks/useOAuth';
import { useToast } from '@/hooks/use-toast';

interface GitHubConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  integrationId: string;
}

export const GitHubConnectionDialog = ({ 
  open, 
  onOpenChange, 
  projectId, 
  integrationId 
}: GitHubConnectionDialogProps) => {
  const [gitUrl, setGitUrl] = useState('');
  const [repository, setRepository] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { getIntegrationByProvider, getConnectionByIntegration } = useConnections(projectId);
  const { connectProvider } = useOAuth();
  const { toast } = useToast();

  // Load existing connection data when dialog opens
  useEffect(() => {
    if (open) {
      const githubIntegration = getIntegrationByProvider('github');
      if (githubIntegration) {
        const existingConnection = getConnectionByIntegration(githubIntegration.id);
        if (existingConnection?.account_config) {
          const config = existingConnection.account_config;
          if (config.git_url) {
            setGitUrl(config.git_url);
          }
          if (config.repository) {
            setRepository(config.repository);
          }
        }
      }
    } else {
      // Clear form when dialog closes
      setGitUrl('');
      setRepository('');
    }
  }, [open, getIntegrationByProvider, getConnectionByIntegration]);

  const extractOwnerFromProfileUrl = (url: string): string | null => {
    try {
      // Handle GitHub profile URL format: https://github.com/username
      const githubProfilePattern = /github\.com[\/:]([^\/]+)\/?$/;
      const match = url.match(githubProfilePattern);
      
      if (match) {
        return match[1]; // The username part
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting owner from profile URL:', error);
      return null;
    }
  };

  const handleConnect = async () => {
    if (!gitUrl.trim() || !repository.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both profile URL and repository name",
        variant: "destructive",
      });
      return;
    }

    // Extract owner name from profile URL
    const ownerName = extractOwnerFromProfileUrl(gitUrl.trim());
    if (!ownerName) {
      toast({
        title: "Error",
        description: "Invalid GitHub profile URL. Please use format: https://github.com/username",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // First start the OAuth flow
      await connectProvider({
        provider: 'github',
        projectId,
        additionalParams: {
          git_url: gitUrl.trim(),
          repository: repository.trim(),
          owner: ownerName
        }
      });

      // The connection will be created automatically by the OAuth callback
      // The OAuth callback will handle storing the tokens and additional config

      toast({
        title: "Success",
        description: "GitHub repository connected successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('GitHub connection failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect GitHub Repository</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="git_url">GitHub Profile URL</Label>
            <Input
              id="git_url"
              placeholder="https://github.com/username"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repository">Repository Name</Label>
            <Input
              id="repository"
              placeholder="my-awesome-project"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Repository
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};