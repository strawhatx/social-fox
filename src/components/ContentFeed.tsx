import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit3, Send, Eye, Twitter, Linkedin, Instagram, Plus, Calendar, Save, Archive } from 'lucide-react';
import { useContentPosts } from '@/hooks/useContentPosts';
import { useToast } from '@/hooks/use-toast';
import { useConnections } from '@/hooks/useConnections';

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Twitter');
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState<ContentPost | null>(null);
  const { toast } = useToast();
  const { loading: connectionsLoading, getIntegrationByProvider, getConnectionByIntegration } = useConnections(project.id);

  const platformToProvider = {
    "x": 'twitter'
  };

  const getProviderForPlatform = (platform: string) => {
    switch (platform) {
      case 'Twitter':
        return 'twitter';
      case 'LinkedIn':
        return 'linkedin';
      case 'Instagram':
        return 'instagram';
      default:
        return '';
    }
  };

  const isPlatformConnected = (platform: string) => {
    //try to map platform to expected provider
    const  mapped_platform  = platformToProvider[platform] || platform;

    const provider = getProviderForPlatform(mapped_platform);
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
      case 'Twitter': return Twitter;
      case 'LinkedIn': return Linkedin;
      case 'Instagram': return Instagram;
      default: return Twitter;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Twitter': return 'bg-brand-orange/10 text-brand-orange';
      case 'LinkedIn': return 'bg-linkedin/10 text-linkedin';
      case 'Instagram': return 'bg-instagram/10 text-instagram';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for your post",
        variant: "destructive",
      });
      return;
    }

    const { error } = await createPost({
      content: newPostContent,
      platform: selectedPlatform,
      status: 'draft'
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      setNewPostContent('');
      setShowCreateDialog(false);
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

    if (andSchedule && scheduledDateTime) {
      if (!isPlatformConnected(editingPost.platform)) {
        toast({
          title: 'Connection required',
          description: `Connect ${editingPost.platform} before scheduling a post. Go to Connections to link your account.`,
          variant: 'destructive',
        });
        return;
      }
      updates.status = 'scheduled';
      updates.scheduled_at = new Date(scheduledDateTime).toISOString();
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
      setEditingPost(null);
      setEditContent('');
      setScheduledDateTime('');
    }
  };

  const handleSchedulePost = (post: ContentPost) => {
    if (!isPlatformConnected(post.platform)) {
      toast({
        title: 'Connection required',
        description: `Connect ${post.platform} before scheduling a post. Go to Connections to link your account.`,
        variant: 'destructive',
      });
      return;
    }
    setPostToSchedule(post);
    setShowScheduleDialog(true);
  };

  const handleConfirmSchedule = async () => {
    if (!postToSchedule || !scheduledDateTime) return;
    if (!isPlatformConnected(postToSchedule.platform)) {
      toast({
        title: 'Connection required',
        description: `Connect ${postToSchedule.platform} before scheduling a post. Go to Connections to link your account.`,
        variant: 'destructive',
      });
      return;
    }

    const { error } = await updatePost(postToSchedule.id, {
      status: 'scheduled',
      scheduled_at: new Date(scheduledDateTime).toISOString(),
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
      setShowScheduleDialog(false);
      setPostToSchedule(null);
      setScheduledDateTime('');
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
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Manual Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your post content here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Create Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSchedulePost(post)}
                          disabled={connectionsLoading || !isPlatformConnected(post.platform)}
                          title={!isPlatformConnected(post.platform) ? `Connect ${post.platform} to schedule` : undefined}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule
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
                        <Button variant="secondary" size="sm" onClick={() => updatePost(post.id, { status: 'posted', posted_at: new Date().toISOString() })}>
                          <Send className="w-4 h-4 mr-2" />
                          Post Now
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
              <Label htmlFor="schedule-datetime">Schedule for later (optional)</Label>
              <Input
                id="schedule-datetime"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
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
                disabled={!scheduledDateTime || !editingPost || connectionsLoading || !isPlatformConnected(editingPost.platform)}
                title={editingPost && !isPlatformConnected(editingPost.platform) ? `Connect ${editingPost.platform} to schedule` : undefined}
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
              <Label htmlFor="schedule-time">Schedule Date & Time</Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSchedule}
                disabled={
                  !scheduledDateTime ||
                  !postToSchedule ||
                  connectionsLoading ||
                  !isPlatformConnected(postToSchedule.platform)
                }
                title={postToSchedule && !isPlatformConnected(postToSchedule.platform) ? `Connect ${postToSchedule.platform} to schedule` : undefined}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}