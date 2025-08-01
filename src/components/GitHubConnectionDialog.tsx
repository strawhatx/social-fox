import { useState } from 'react';
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
  const { createConnection } = useConnections(projectId);
  const { connectProvider } = useOAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!gitUrl.trim() || !repository.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both repository URL and repository name",
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
          repository: repository.trim()
        }
      });

      // Create the connection with the additional config
      const { error } = await createConnection(integrationId, {
        git_url: gitUrl.trim(),
        repository: repository.trim()
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "GitHub repository connected successfully",
      });
      
      onOpenChange(false);
      setGitUrl('');
      setRepository('');
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
            <Label htmlFor="git_url">Repository URL</Label>
            <Input
              id="git_url"
              placeholder="https://github.com/username/repository"
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