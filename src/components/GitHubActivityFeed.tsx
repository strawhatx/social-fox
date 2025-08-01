import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitCommit, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GitHubCommit {
  author: {
    login: string;
    avatar_url: string;
  };
  message: string;
}

interface GitHubTicket {
  title: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
}

interface GitHubData {
  description: string;
  commits: GitHubCommit[];
  tickets: GitHubTicket[];
  comments: number;
  login?: string;
}

interface GitHubActivityFeedProps {
  projectId: string;
}

export const GitHubActivityFeed = ({ projectId }: GitHubActivityFeedProps) => {
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGitHubData();
  }, [projectId]);

  const fetchGitHubData = async () => {
    try {
      setLoading(true);
      console.log('Fetching GitHub data for project:', projectId);
      
      const { data, error } = await supabase.functions.invoke('fetch-github-data', {
        body: { projectId }
      });

      if (error) {
        console.error('Error fetching GitHub data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch GitHub activity",
          variant: "destructive",
        });
        return;
      }

      console.log('GitHub data received:', data);
      setGithubData(data.data);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch GitHub activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            GitHub Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!githubData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            GitHub Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No GitHub connection found. Connect GitHub to see recent activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            GitHub Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <GitCommit className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{githubData.commits.length}</p>
                <p className="text-sm text-muted-foreground">Recent Commits</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{githubData.tickets.length}</p>
                <p className="text-sm text-muted-foreground">Active Tickets</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{githubData.comments}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
            </div>
          </div>
          {githubData.login && (
            <p className="text-sm text-muted-foreground mt-4">
              Connected to GitHub account: <span className="font-medium">{githubData.login}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Commits */}
      {githubData.commits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {githubData.commits.slice(0, 10).map((commit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={commit.author.avatar_url} alt={commit.author.login} />
                    <AvatarFallback>{commit.author.login.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{commit.author.login}</p>
                    <p className="text-sm text-muted-foreground truncate">{commit.message}</p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Tickets */}
      {githubData.tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {githubData.tickets.slice(0, 10).map((ticket, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.user.avatar_url} alt={ticket.user.login} />
                    <AvatarFallback>{ticket.user.login.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">Created by {ticket.user.login}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={ticket.state === 'open' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {ticket.state}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {githubData.commits.length === 0 && githubData.tickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <GitCommit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No Recent Activity</p>
            <p className="text-muted-foreground">
              Start making commits or creating issues to see your GitHub activity here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};