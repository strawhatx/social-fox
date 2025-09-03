"use client";

import { useState } from "react";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  UserPlus,
  ExternalLink,
  Sparkles,
  Clock,
  Hash,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { title } from "process";
import { toast } from "@/hooks/use-toast";

export default function PersonalizedOutreach() {
  const [engagedTweets, setEngagedTweets] = useState(new Set());
  const [followedAccounts, setFollowedAccounts] = useState(new Set());
  const [joinedCommunities, setJoinedCommunities] = useState(new Set());

  // Mock user niche data
  const userNiche = {
    primaryTopics: ["WebDev", "React", "TypeScript", "UI/UX"],
    bio: "Frontend Developer building React apps",
    recentHashtags: ["#WebDev", "#React", "#TypeScript", "#Frontend", "#JavaScript"],
    followers: 1247,
    following: 892,
    engagement: 4.2
  };

  // Mock recommended tweets
  const recommendedTweets = [
    {
      id: 1,
      author: "sarah_dev",
      authorName: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      content: "Just shipped a new React component library with TypeScript! The developer experience is so much better with proper typing. What's your favorite TS feature? 🚀",
      hashtags: ["#React", "#TypeScript", "#WebDev"],
      engagement: { likes: 45, replies: 12, retweets: 8 },
      timeAgo: "2h",
      influencerLevel: "peer",
      trendingScore: 8.5,
      matchReason: "Uses your hashtags #React #TypeScript"
    },
    {
      id: 2,
      author: "dan_frontend",
      authorName: "Dan Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      content: "Hot take: CSS-in-JS vs CSS modules debate is missing the point. The real question is: does your solution scale with your team? 🤔",
      hashtags: ["#CSS", "#WebDev", "#Frontend"],
      engagement: { likes: 128, replies: 34, retweets: 22 },
      timeAgo: "4h",
      influencerLevel: "influencer",
      trendingScore: 9.2,
      matchReason: "Popular in Frontend community"
    },
    {
      id: 3,
      author: "ux_jessica",
      authorName: "Jessica Park",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      content: "Design systems aren't just for big companies. Even solo developers benefit from consistent patterns. Here's how I built mine in a weekend... 🧵",
      hashtags: ["#DesignSystems", "#UI", "#WebDev"],
      engagement: { likes: 89, replies: 19, retweets: 15 },
      timeAgo: "6h",
      influencerLevel: "peer",
      trendingScore: 7.8,
      matchReason: "Similar audience overlap"
    },
    {
      id: 4,
      author: "react_tips",
      authorName: "React Tips",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      content: "useCallback vs useMemo - when to use which? A thread for React developers who want to optimize performance without overthinking it 🧠⚡",
      hashtags: ["#React", "#Performance", "#JavaScript"],
      engagement: { likes: 234, replies: 67, retweets: 89 },
      timeAgo: "1h",
      influencerLevel: "influencer",
      trendingScore: 9.8,
      matchReason: "Trending in React community"
    }
  ];

  // Mock suggested accounts
  const suggestedAccounts = [
    {
      id: 1,
      username: "alex_frontend",
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      bio: "Senior Frontend Engineer @stripe • React & TypeScript enthusiast • Building developer tools",
      followers: 15600,
      following: 892,
      commonHashtags: ["#React", "#TypeScript", "#WebDev"],
      matchScore: 94,
      mutualConnections: 12,
      recentActivity: "Posted about React 18 features",
      engagementRate: 6.8
    },
    {
      id: 2,
      username: "maya_designs",
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      bio: "UI/UX Designer • Design Systems • Frontend Developer • Making web beautiful one component at a time",
      followers: 8900,
      following: 1200,
      commonHashtags: ["#UI", "#DesignSystems", "#Frontend"],
      matchScore: 87,
      mutualConnections: 8,
      recentActivity: "Shared design system tips",
      engagementRate: 5.2
    }
  ];

  // Mock communities
  const suggestedCommunities = [
    {
      id: 1,
      name: "React Developers",
      platform: "Discord",
      members: 45000,
      description: "Active community of React developers sharing tips, code reviews, and job opportunities. Daily discussions on latest React features.",
      tags: ["React", "JavaScript", "Frontend"],
      activity: "Very High",
      joinUrl: "https://discord.gg/react-devs",
      matchReason: "Perfect match for React developers",
      recentTopics: ["React 18 Concurrent Features", "State Management Patterns", "Testing Strategies"]
    }
  ];

  const handleEngageTweet = (tweetId: number, action: string) => {
    setEngagedTweets(prev => new Set(prev).add(tweetId));
    toast({
      title: `Tweet ${action}!`,
      description: `You ${action} the tweet. Great way to increase engagement!`
    });
  };

  const handleFollowAccount = (accountId: number) => {
    setFollowedAccounts(prev => new Set(prev).add(accountId));
    toast({
      title: "Account followed!",
      description: "This account will help expand your network in your niche."
    });
  };

  const handleJoinCommunity = (communityId: number) => {
    setJoinedCommunities(prev => new Set(prev).add(communityId));
    toast({
      title: "Community joined!",
      description: "You'll get notifications about this community's activities."
    });
  };

  const getInfluencerBadge = (level: string) => {
    if (level === "influencer") {
      return <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">Influencer</Badge>;
    }
    return <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">Peer</Badge>;
  };

  const getTrendingIcon = (score: number) => {
    if (score >= 9) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (score >= 8) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    return <TrendingUp className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <SidebarLayout>
    <div className="p-6 space-y-6">
      {/* Header with Niche Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1>Personalized Outreach Assistant</h1>
              <p className="text-muted-foreground">AI-powered recommendations to grow your network and engagement</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Niche Analysis Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <BarChart3 className="h-5 w-5" />
              Your Niche Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Primary Topics</p>
                <div className="flex flex-wrap gap-1">
                  {userNiche.primaryTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-100">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recent Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {userNiche.recentHashtags.slice(0, 3).map((hashtag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Engagement Score</p>
                <div className="flex items-center gap-2">
                  <Progress value={userNiche.engagement * 20} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{userNiche.engagement}/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recommended Tweets */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-green-600">Tweets to Engage With</h2>
              <Badge variant="outline" className="text-xs">
                {recommendedTweets.length} recommendations
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Updated 15 minutes ago</p>
          </div>

          <div className="space-y-4">
            {recommendedTweets.map((tweet) => (
              <Card key={tweet.id} className="border-green-200 hover:bg-green-50/50 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Author Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={tweet.avatar} />
                          <AvatarFallback>{tweet.authorName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{tweet.authorName}</p>
                            <p className="text-sm text-muted-foreground">@{tweet.author}</p>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{tweet.timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getInfluencerBadge(tweet.influencerLevel)}
                            <div className="flex items-center gap-1">
                              {getTrendingIcon(tweet.trendingScore)}
                              <span className="text-xs text-muted-foreground">Trending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tweet Content */}
                    <p className="text-sm leading-relaxed">{tweet.content}</p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {tweet.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>

                    {/* Match Reason */}
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-700">{tweet.matchReason}</p>
                    </div>

                    {/* Engagement Stats & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-green-100">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{tweet.engagement.likes} likes</span>
                        <span>{tweet.engagement.replies} replies</span>
                        <span>{tweet.engagement.retweets} retweets</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {engagedTweets.has(tweet.id) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Engaged</span>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEngageTweet(tweet.id, "liked")}
                              className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                              <Heart className="h-3 w-3" />
                              Like
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEngageTweet(tweet.id, "replied to")}
                              className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            >
                              <MessageCircle className="h-3 w-3" />
                              Reply
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar with Accounts & Communities */}
        <div className="space-y-6">
          {/* Suggested Accounts */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-600">Accounts to Follow</h3>
            </div>

            {suggestedAccounts.map((account) => (
              <Card key={account.id} className="border-purple-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={account.avatar} />
                        <AvatarFallback>{account.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{account.name}</p>
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">
                            {account.matchScore}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{account.bio}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">{account.followers.toLocaleString()}</span> followers
                      </div>
                      <div>
                        <span className="font-medium">{account.mutualConnections}</span> mutual
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {account.commonHashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>

                    {followedAccounts.has(account.id) ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Following</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleFollowAccount(account.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Follow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Suggested Communities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-orange-600" />
              <h3 className="text-orange-600">Communities to Join</h3>
            </div>

            {suggestedCommunities.map((community) => (
              <Card key={community.id} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{community.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 bg-orange-50">
                            {community.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {community.members.toLocaleString()} members
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{community.description}</p>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Recent Topics:</p>
                      <div className="space-y-1">
                        {community.recentTopics.map((topic, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-orange-400"></div>
                            <span className="text-xs text-muted-foreground">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {community.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {joinedCommunities.has(community.id) ? (
                      <div className="flex items-center gap-2 text-orange-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Joined</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleJoinCommunity(community.id)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Join Community
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily Progress */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                <Clock className="h-4 w-4" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tweets Engaged</span>
                  <span className="font-medium">{engagedTweets.size}/5</span>
                </div>
                <Progress value={(engagedTweets.size / 5) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accounts Followed</span>
                  <span className="font-medium">{followedAccounts.size}/2</span>
                </div>
                <Progress value={(followedAccounts.size / 2) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Communities Joined</span>
                  <span className="font-medium">{joinedCommunities.size}/1</span>
                </div>
                <Progress value={(joinedCommunities.size / 1) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
}