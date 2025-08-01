import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Edit3, RefreshCw, Send, Eye, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useContentPosts } from '@/hooks/useContentPosts';
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

// Remove local interface since we'll use the one from the hook
import { ContentPost } from '@/hooks/useContentPosts';

interface ContentFeedProps {
  project: Project;
}

export default function ContentFeed({ project }: ContentFeedProps) {
  const { posts, loading, createPost, updatePost } = useContentPosts(project.id);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'needs_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return Twitter;
      case 'LinkedIn': return Linkedin;
      case 'Instagram': return Instagram;
      default: return Twitter;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-twitter/10 text-twitter';
      case 'LinkedIn': return 'bg-linkedin/10 text-linkedin';
      case 'Instagram': return 'bg-instagram/10 text-instagram';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(post => post.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Content Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Feed</h2>
          <p className="text-muted-foreground">Manage and review AI-generated content</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Content
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({posts.filter(p => p.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({posts.filter(p => p.status === 'archived').length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({posts.filter(p => p.status === 'scheduled').length})</TabsTrigger>
          <TabsTrigger value="posted">Posted ({posts.filter(p => p.status === 'posted').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPosts.map((post) => {
            const PlatformIcon = getPlatformIcon(post.platform);
            
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPlatformColor(post.platform)}`}>
                        <PlatformIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{post.platform}</h3>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.status === 'scheduled' && post.scheduled_at ? 
                            `Scheduled for ${new Date(post.scheduled_at).toLocaleString()}` : 
                            `Created ${new Date(post.created_at).toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                  </div>

                  {post.engagement && (
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>{post.engagement.likes} likes</span>
                      <span>{post.engagement.shares} shares</span>
                      <span>{post.engagement.comments} comments</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {post.status === 'draft' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Schedule
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'archived' && (
                      <>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'scheduled' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Schedule
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Post Now
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'posted' && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Post
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}