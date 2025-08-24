import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit3, Send, Eye, Twitter, Linkedin, Instagram, Plus, Calendar, Save, Archive, AlertTriangle } from 'lucide-react';
import { useContentPosts } from '@/hooks/useContentPosts';
import { useToast } from '@/hooks/use-toast';
import { useConnections } from '@/hooks/useConnections';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

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
  const { posts, loading, updatePost } = useContentPosts(project.id);
  const [activeTab, setActiveTab] = useState('all');
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState<ContentPost | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loading: connectionsLoading, getIntegrationByProvider, getConnectionByIntegration } = useConnections(project.id);
  const { canSchedulePosts, hasCredits, credits, loading: subscriptionLoading, refetch: refetchSubscription, subscription } = useSubscription();
  const hasPaidSubscription = !!subscription?.subscription_is_active;

  const getProviderForPlatform = (platform: string) => {
    switch (platform) {
      case 'x':
        return 'twitter';

      default:
        return platform;
    }
  };

  const isPlatformConnected = (platform: string) => {
    const provider = getProviderForPlatform(platform);
    if (!provider) return false;

    const integration = getIntegrationByProvider(provider);
    if (!integration) return false;

    const connection = getConnectionByIntegration(integration.id);
    return !!connection;
  };

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
      case 'x': return Twitter;
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      default: '';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'x': return 'bg-brand-orange/10 text-brand-orange';
      case 'twitter': return 'bg-brand-orange/10 text-brand-orange';
      case 'linkedin': return 'bg-linkedin/10 text-linkedin';
      case 'instagram': return 'bg-instagram/10 text-instagram';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleEditPost = (post: ContentPost) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (andSchedule = false) => {
    if (!editingPost || !editContent.trim()) return;

    const updates: Partial<ContentPost> = {
      content: editContent,
    };

    if (andSchedule && scheduledDate) {
      if (!isPlatformConnected(editingPost.platform)) {
        toast({
          title: 'Connection required',
          description: `Connect ${editingPost.platform} in Platform Settings to schedule this post.`,
          variant: 'destructive',
        });
        return;
      }
      
      if (!hasPaidSubscription) {
        toast({
          title: 'Plan required',
          description: 'You need an active plan to schedule posts. Manage your subscription in Settings.',
          variant: 'destructive',
        });
        navigate('/settings');
        return;
      }
      
      updates.status = 'scheduled';
      updates.scheduled_at = scheduledDate;
    }

    const { error } = await updatePost(editingPost.id, updates);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: andSchedule ? "Post saved and scheduled" : "Post saved successfully",
      });
      if (andSchedule) {
        // Refresh subscription data to update credit count
        refetchSubscription();
      }
      setEditingPost(null);
      setEditContent('');
      setScheduledDate('');
    }
  };

  const handleSchedulePost = (post: ContentPost) => {
    if (!isPlatformConnected(post.platform)) {
      toast({
        title: 'Connection required',
        description: `Connect ${post.platform} in Platform Settings to schedule this post.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!hasPaidSubscription) {
      toast({
        title: 'Plan required',
        description: 'You need an active plan to schedule posts. Manage your subscription in Settings.',
        variant: 'destructive',
      });
      navigate('/settings');
      return;
    }
    
    setPostToSchedule(post);
    setShowScheduleDialog(true);
  };

  const handleConfirmSchedule = async () => {
    if (!postToSchedule || !scheduledDate) return;
    if (!isPlatformConnected(postToSchedule.platform)) {
      toast({
        title: 'Connection required',
        description: `Connect ${postToSchedule.platform} in Platform Settings to schedule this post.`,
        variant: 'destructive',
      });
      return;
    }

    if (!hasPaidSubscription) {
      toast({
        title: 'Plan required',
        description: 'You need an active plan to schedule posts. Manage your subscription in Settings.',
        variant: 'destructive',
      });
      navigate('/settings');
      return;
    }

    const { error } = await updatePost(postToSchedule.id, {
      status: 'scheduled',
      scheduled_at: scheduledDate,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post scheduled successfully",
      });
      // Refresh subscription data to update credit count
      refetchSubscription();
      setShowScheduleDialog(false);
      setPostToSchedule(null);
      setScheduledDate('');
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
                            `Scheduled for ${new Date(post.scheduled_at).toLocaleDateString()}` : 
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
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSchedulePost(post)}
                          disabled={
                            connectionsLoading ||
                            subscriptionLoading ||
                            (hasPaidSubscription && !hasCredits(1))
                          }
                          title={
                            !isPlatformConnected(post.platform)
                              ? `Connect ${post.platform} to schedule`
                              : hasPaidSubscription && !hasCredits(1)
                                ? `Need credits to schedule (Current: ${credits?.total_credits || 0})`
                                : undefined
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {hasPaidSubscription && !hasCredits(1) ? `Schedule (${credits?.total_credits || 0} credits)` : "Schedule"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => updatePost(post.id, { status: 'archived' })}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'archived' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => updatePost(post.id, { status: 'draft' })}>
                          <Send className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'scheduled' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => updatePost(post.id, { status: 'archived' })}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </>
                    )}
                    
                    {post.status === 'posted' && (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Post
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => updatePost(post.id, { status: 'archived' })}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Edit Post Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                placeholder="Edit your post content..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Schedule for later (optional)</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingPost(null)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleSaveEdit(false)}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => handleSaveEdit(true)}
                disabled={
                  !scheduledDate ||
                  !editingPost ||
                  connectionsLoading ||
                  subscriptionLoading ||
                  (hasPaidSubscription && !hasCredits(1))
                }
                title={
                  editingPost && !isPlatformConnected(editingPost.platform)
                    ? `Connect ${editingPost.platform} to schedule`
                    : hasPaidSubscription && !hasCredits(1)
                      ? `Need credits to schedule (Current: ${credits?.total_credits || 0})`
                      : undefined
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Save & Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Post Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date-2">Schedule Date</Label>
              <Input
                id="schedule-date-2"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
              <span>Reminder: Posts are only published if you still have credits at the scheduled time.</span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={
                  !scheduledDate ||
                  !postToSchedule ||
                  connectionsLoading ||
                  subscriptionLoading ||
                  !canSchedulePosts
                }
                title={
                  postToSchedule && !isPlatformConnected(postToSchedule.platform) 
                    ? `Connect ${postToSchedule.platform} to schedule` 
                    : !canSchedulePosts 
                      ? `Need credits to schedule (Current: ${credits?.total_credits || 0})` 
                      : undefined
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* No upgrade modal; we redirect to Settings with a toast */}
    </div>
  );
}