import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { GitHubConnectionDialog } from '@/components/GitHubConnectionDialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';

const Step3GitHub = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { subscription, refetch: refetchSubscription } = useSubscription();
  const { getIntegrationByProvider, getConnectionByIntegration } = useConnections(projectId);
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);

  const hasStripeSubscription = Boolean(
    subscription?.stripe_customer_id && subscription?.subscription_is_active
  );

  const githubIntegration = getIntegrationByProvider('github');
  const githubConnection = githubIntegration ? getConnectionByIntegration(githubIntegration.id) : null;
  const isGitHubConnected = Boolean(
    githubConnection?.config_public?.repository?.owner && 
    githubConnection?.config_public?.repository?.repository
  );

  const handleCreateFreeSubscription = async () => {
    setIsCreatingSubscription(true);
    try {
      const { data, error } = await fetchWithAuth('create-free-subscription', { method: 'POST' });
      if (error) throw new Error(error);
      
      toast({
        title: "Success",
        description: "Free subscription created! You can now connect GitHub.",
      });
      
      // Refresh subscription data
      await refetchSubscription();
    } catch (error: any) {
      console.error('Error creating free subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create free subscription",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleOpen = () => {
    if (!hasStripeSubscription) {
      toast({
        title: "Subscription Required",
        description: "Please create a free subscription first to connect GitHub.",
        variant: "destructive",
      });
      return;
    }
    setShowDialog(true);
  };

  const handleNext = () => {
    if (!projectId) return;
    if (!isGitHubConnected) {
      toast({
        title: "GitHub Connection Required",
        description: "Please connect your GitHub repository before proceeding.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/create-project/${projectId}/style`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Connect GitHub Repository
        </CardTitle>
        <CardDescription>
          Connect your GitHub repo so Social Fox can automatically generate posts from your commits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasStripeSubscription && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <h4 className="font-medium text-orange-800">Subscription Required</h4>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              You need a free subscription to connect GitHub and enable automatic content generation.
            </p>
            <Button 
              onClick={handleCreateFreeSubscription}
              disabled={isCreatingSubscription}
              size="sm"
              className="w-full"
            >
              {isCreatingSubscription ? "Creating..." : "Create Free Subscription"}
            </Button>
          </div>
        )}

        {hasStripeSubscription && !isGitHubConnected && (
          <Button onClick={handleOpen} className="w-full">
            <Github className="h-4 w-4 mr-2" />
            Connect GitHub Repository
          </Button>
        )}

        {hasStripeSubscription && isGitHubConnected && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-800">GitHub Connected</h4>
            </div>
            <p className="text-sm text-green-700">
              Repository: {githubConnection?.config_public?.repository?.repository_url}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          This is a one-time setup. After this, Social Fox will automatically generate drafts from your commits!
        </p>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={!isGitHubConnected}
            className={!isGitHubConnected ? "opacity-50" : ""}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>

      <GitHubConnectionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        projectId={projectId || ''}
        onConnectionSuccess={() => {
          setShowDialog(false);
          // Force a small delay to allow the connection data to update
          setTimeout(() => window.location.reload(), 1000);
        }}
      />
    </Card>
  );
};

export default Step3GitHub;


