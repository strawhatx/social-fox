import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Share, 
  Users, 
  Filter,
  Sparkles,
  Eye,
  BarChart3,
  User,
  MessageSquare,
  ExternalLink,
  Flame,
  Repeat2
} from "lucide-react";

export default function Community() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [engagedPosts, setEngagedPosts] = useState(new Set());

  // Mock trending posts
  const trendingPosts = [
    {
      id: 1,
      author: "buildwithzach",
      authorName: "Zach Peterson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      verified: true,
      content: "Just launched my SaaS MVP after 6 months of building in public! From $0 to $2k MRR in the first week. The power of community feedback is incredible. Here's what I learned... 🧵",
      hashtags: ["#buildinpublic", "#saas", "#startup", "#indiehacker"],
      metrics: { likes: 847, comments: 156, retweets: 234, views: 12500 },
      timeAgo: "2h",
      trendingReason: "Viral in #buildinpublic",
      trendingScore: 9.8,
      community: "Indie Hackers",
      engagement: { rate: 8.4, trend: "up" }
    },
    {
      id: 2,
      author: "uxdesigner_amy",
      authorName: "Amy Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      verified: false,
      content: "Hot take: Dark mode isn't just about aesthetics. It's about accessibility, battery life, and user preference. But designing for both light and dark modes from day one? That's the real challenge. 🌙",
      hashtags: ["#ux", "#design", "#darkmode", "#accessibility"],
      metrics: { likes: 423, comments: 89, retweets: 127, views: 8900 },
      timeAgo: "4h",
      trendingReason: "Trending in Design Twitter",
      trendingScore: 8.7,
      community: "Design",
      engagement: { rate: 6.2, trend: "up" }
    },
    {
      id: 3,
      author: "reactninja",
      authorName: "Dev Kumar",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      verified: true,
      content: "React 19 is changing everything we know about state management. useOptimistic() is a game changer for UX. Here's a real-world example that will blow your mind 🤯",
      hashtags: ["#react", "#react19", "#webdev", "#javascript"],
      metrics: { likes: 1240, comments: 203, retweets: 445, views: 18700 },
      timeAgo: "1h",
      trendingReason: "Hot in React community",
      trendingScore: 9.5,
      community: "React Developers",
      engagement: { rate: 9.1, trend: "up" }
    },
    {
      id: 4,
      author: "airesearcher",
      authorName: "Dr. Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      verified: true,
      content: "The AI bubble might be real, but the underlying technology isn't going anywhere. We're just getting started. The next wave will be about integration, not replacement. 🚀",
      hashtags: ["#ai", "#machinelearning", "#tech", "#future"],
      metrics: { likes: 567, comments: 124, retweets: 189, views: 9800 },
      timeAgo: "3h",
      trendingReason: "Popular in AI/ML",
      trendingScore: 8.2,
      community: "AI/ML",
      engagement: { rate: 7.3, trend: "stable" }
    },
    {
      id: 5,
      author: "product_manager",
      authorName: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      verified: false,
      content: "Shipped 47 features this quarter. Only 3 moved the needle. The hardest lesson in product management: saying no is more important than saying yes. Focus is everything. 🎯",
      hashtags: ["#productmanagement", "#focus", "#startup", "#growth"],
      metrics: { likes: 312, comments: 67, retweets: 98, views: 5600 },
      timeAgo: "6h",
      trendingReason: "Engaging PM discussion",
      trendingScore: 7.8,
      community: "Product",
      engagement: { rate: 5.9, trend: "up" }
    }
  ];

  // Mock community highlights
  const communityHighlights = {
    activeDiscussions: [
      {
        title: "React 19 Migration Guide",
        community: "React Developers",
        participants: 45,
        messages: 234,
        lastActive: "5m ago"
      },
      {
        title: "SaaS Pricing Strategies 2024",
        community: "Indie Hackers",
        participants: 67,
        messages: 189,
        lastActive: "12m ago"
      },
      {
        title: "Design Systems at Scale",
        community: "Design",
        participants: 29,
        messages: 156,
        lastActive: "18m ago"
      }
    ],
    popularUsers: [
      {
        username: "buildwithzach",
        name: "Zach Peterson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        followers: "24.5K",
        engagement: "High"
      },
      {
        username: "reactninja",
        name: "Dev Kumar",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
        followers: "18.2K",
        engagement: "Very High"
      },
      {
        username: "airesearcher",
        name: "Dr. Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        followers: "31.7K",
        engagement: "High"
      }
    ]
  };

  // Filter options
  const topics = [
    { value: "all", label: "All Topics", count: 45 },
    { value: "buildinpublic", label: "#buildinpublic", count: 12 },
    { value: "react", label: "#react", count: 8 },
    { value: "design", label: "#design", count: 6 },
    { value: "ai", label: "#ai", count: 9 },
    { value: "startup", label: "#startup", count: 10 }
  ];

  const communities = [
    { value: "all", label: "All Communities" },
    { value: "indie-hackers", label: "Indie Hackers" },
    { value: "react", label: "React Developers" },
    { value: "design", label: "Design" },
    { value: "ai-ml", label: "AI/ML" },
    { value: "product", label: "Product" }
  ];

  const handleEngagement = (postId: number, action: string) => {
    setEngagedPosts(prev => new Set(prev).add(postId));
    toast({
      title: `Post ${action}!`,
      description: `You ${action} this trending post. Great engagement!`
    });
  };

  const getTrendingIcon = (score: number) => {
    if (score >= 9.5) return <Flame className="h-4 w-4 text-red-500" />;
    if (score >= 9) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (score >= 8) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const getEngagementColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const filteredPosts = trendingPosts.filter(post => {
    try {
      if (selectedTopic !== "all" && !post.hashtags?.some(tag => tag?.includes(selectedTopic))) return false;
      if (selectedFilter !== "all") {
        const communityKey = post.community?.toLowerCase()?.replace(/\s+/g, '-') || '';
        const filterKey = selectedFilter?.replace('-', '') || '';
        if (communityKey !== filterKey) return false;
      }
      return true;
    } catch (error) {
      console.warn('Error filtering post:', error);
      return true;
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1>Community Discovery</h1>
              <p className="text-muted-foreground">Trending posts and discussions in your niche communities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              Live
            </Badge>
            <p className="text-sm text-muted-foreground">Updated 2 min ago</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Filters:</span>
              </div>
              
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{topic.label}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {topic.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community.value} value={community.value}>
                      {community.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">
                  {filteredPosts.length} trending posts
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <h2 className="text-orange-600">Trending Posts</h2>
            <Badge variant="outline" className="text-xs">
              Last 24 hours
            </Badge>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="border-orange-200 hover:bg-orange-50/50 transition-colors">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Author & Meta */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback>{post.authorName?.slice(0, 2) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{post.authorName}</p>
                            {post.verified && <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">✓</Badge>}
                            <span className="text-sm text-muted-foreground">@{post.author}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{post.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                              {post.community}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getTrendingIcon(post.trendingScore)}
                              <span className="text-xs text-muted-foreground">Score: {post.trendingScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm leading-relaxed">{post.content}</p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags?.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                          {hashtag}
                        </Badge>
                      )) || null}
                    </div>

                    {/* Trending Reason */}
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                      <Sparkles className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-700 font-medium">{post.trendingReason}</p>
                      <div className="ml-auto flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-orange-600" />
                        <span className="text-xs text-orange-600">{post.engagement.rate}% engagement</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 py-2 border-t border-orange-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{post.metrics?.views?.toLocaleString() || '0'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{post.metrics?.likes || '0'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">likes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{post.metrics?.comments || '0'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">replies</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Repeat2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{post.metrics?.retweets || '0'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">retweets</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {engagedPosts.has(post.id) ? (
                          <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                            ✓ Engaged
                          </Badge>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEngagement(post.id, "liked")}
                              className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                              <Heart className="h-3 w-3" />
                              Like
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEngagement(post.id, "replied to")}
                              className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            >
                              <MessageCircle className="h-3 w-3" />
                              Reply
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEngagement(post.id, "shared")}
                              className="flex items-center gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                            >
                              <Share className="h-3 w-3" />
                              Share
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3 w-3" />
                        View Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar - Community Highlights */}
        <div className="space-y-6">
          {/* Active Discussions */}
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <MessageSquare className="h-5 w-5" />
                Active Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {communityHighlights.activeDiscussions.map((discussion, index) => (
                <div key={index} className="p-3 rounded-lg border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{discussion.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{discussion.community}</span>
                      <span>{discussion.lastActive}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{discussion.participants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{discussion.messages}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Users */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <User className="h-5 w-5" />
                Popular Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {communityHighlights.popularUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{user.followers}</p>
                    <Badge variant="outline" className={`text-xs ${user.engagement === 'Very High' ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                      {user.engagement}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <BarChart3 className="h-5 w-5" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-medium">24</p>
                  <p className="text-xs text-muted-foreground">Communities</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-medium">156</p>
                  <p className="text-xs text-muted-foreground">Trending Posts</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-medium">2.4K</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-medium">89%</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}