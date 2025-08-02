import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useOAuth } from '@/hooks/useOAuth';
import { useToast } from '@/hooks/use-toast';

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
  const { connectProvider, isConnecting } = useOAuth();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectProvider({
        provider: 'github',
        projectId,
        additionalParams: {
          scope: 'repo,user:email'
        }
      });

      toast({
        title: "Success",
        description: "GitHub connected successfully",
      });

      onConnectionSuccess?.();
      onClose();
    } catch (error) {
      console.error('GitHub connection failed:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to GitHub",
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
      </DialogContent>
    </Dialog>
  );
};