import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal, Edit3, RefreshCw, Send, Eye, Twitter, Linkedin, Instagram } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  contentSources: number;
  lastGenerated: string;
  status: 'active' | 'paused' | 'draft';
  roles: {
    brand_builder: boolean;
    content_creator: boolean;
    audience_researcher: boolean;
    campaign_planner: boolean;
    channel_manager: boolean;
    analytics_tracker: boolean;
    lead_generator: boolean;
    community_engager: boolean;
    growth_hacker: boolean;
  };
  brandVoice: string;
  targetAudience: string;
}

interface ContentPost {
  id: string;
  content: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posted' | 'needs_review';
  scheduledFor?: string;
  createdAt: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

interface ContentFeedProps {
  project: Project;
}

const mockPosts: ContentPost[] = [
  {
    id: '1',
    content: 'Excited to share our latest workflow automation features! 🚀 Streamline your processes and boost productivity with Syncflow. #productivity #automation',
    platform: 'Twitter',
    status: 'posted',
    createdAt: '2 hours ago',
    engagement: { likes: 24, shares: 8, comments: 5 }
  },
  {
    id: '2',
    content: 'How workflow automation is transforming modern businesses: From manual processes to intelligent automation, companies are seeing 40% efficiency gains...',
    platform: 'LinkedIn',
    status: 'scheduled',
    scheduledFor: 'Tomorrow at 9:00 AM',
    createdAt: '1 day ago'
  },
  {
    id: '3',
    content: 'Behind the scenes: Building Syncflow\'s new integration dashboard. Our team focused on user experience and seamless connectivity...',
    platform: 'LinkedIn',
    status: 'needs_review',
    createdAt: '2 days ago'
  },
  {
    id: '4',
    content: '✨ New feature alert: Smart task prioritization is now live! Let AI help you focus on what matters most.',
    platform: 'Twitter',
    status: 'draft',
    createdAt: '3 days ago'
  }
];

export default function ContentFeed({ project }: ContentFeedProps) {
  const [posts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState('all');

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
          <TabsTrigger value="needs_review">Review ({posts.filter(p => p.status === 'needs_review').length})</TabsTrigger>
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
                          {post.status === 'scheduled' && post.scheduledFor ? 
                            `Scheduled for ${post.scheduledFor}` : 
                            `Created ${post.createdAt}`
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
                    
                    {post.status === 'needs_review' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Approve & Schedule
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