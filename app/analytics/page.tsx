import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { Users, TrendingUp, TrendingDown, Calendar, Target, Activity, Heart, MessageCircle, Repeat2, Clock, Hash, BarChart3 } from "lucide-react";

// Account data
const accountData = {
  profile: {
    name: "Alex Chen",
    username: "alexbuilds",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    joinDate: "March 2020",
    verified: false
  },
  currentStats: {
    followers: 12698,
    following: 890,
    totalTweets: 1247
  },
  accountHealth: "growing" as "growing" | "stable" | "declining"
};

// Follower growth data
const followerHistory = [
  { date: "Jan 1", followers: 11850, gained: 45, lost: 12, net: 33 },
  { date: "Jan 3", followers: 11921, gained: 67, lost: 29, net: 38 },
  { date: "Jan 5", followers: 12023, gained: 89, lost: 33, net: 56 },
  { date: "Jan 7", followers: 12167, gained: 102, lost: 24, net: 78 },
  { date: "Jan 9", followers: 12298, gained: 74, lost: 21, net: 53 },
  { date: "Jan 11", followers: 12398, gained: 67, lost: 25, net: 42 },
  { date: "Jan 13", followers: 12503, gained: 89, lost: 31, net: 58 },
  { date: "Jan 15", followers: 12632, gained: 87, lost: 22, net: 65 },
  { date: "Jan 16", followers: 12698, gained: 91, lost: 25, net: 66 }
];

// Top performing tweets
const topTweets = [
  {
    id: "1",
    content: "Just shipped our biggest feature yet! 🎉 The response from our community has been incredible. Building in public really works...",
    metrics: { likes: 1247, retweets: 234, replies: 89, engagement_rate: 12.8 },
    timestamp: "2 days ago",
    type: "thread"
  },
  {
    id: "2",
    content: "Quick CSS tip: Use clamp() for responsive typography that scales perfectly across devices. No more media query madness! 🎨",
    metrics: { likes: 892, retweets: 456, replies: 67, engagement_rate: 15.2 },
    timestamp: "3 days ago",
    type: "tip"
  },
  {
    id: "3",
    content: "The biggest mistake I made as a first-time founder? Trying to build everything myself. Here's what delegation taught me...",
    metrics: { likes: 756, retweets: 189, replies: 134, engagement_rate: 11.4 },
    timestamp: "4 days ago",
    type: "story"
  }
];

// Engagement trends
const engagementTrends = [
  { date: "Jan 10", engagement_rate: 14.1, tweets: 3 },
  { date: "Jan 11", engagement_rate: 6.8, tweets: 2 },
  { date: "Jan 12", engagement_rate: 8.7, tweets: 2 },
  { date: "Jan 13", engagement_rate: 11.4, tweets: 3 },
  { date: "Jan 14", engagement_rate: 15.2, tweets: 2 },
  { date: "Jan 15", engagement_rate: 12.8, tweets: 4 },
  { date: "Jan 16", engagement_rate: 9.5, tweets: 2 }
];

// Best posting times
const bestPostingTimes = [
  { time: "9:00 AM", engagement: 4.2, day: "Weekdays" },
  { time: "1:00 PM", engagement: 3.1, day: "Weekdays" },
  { time: "7:00 PM", engagement: 3.9, day: "Weekdays" },
  { time: "10:00 AM", engagement: 2.8, day: "Weekends" },
  { time: "2:00 PM", engagement: 2.1, day: "Weekends" },
  { time: "8:00 PM", engagement: 2.4, day: "Weekends" }
];

// Tweet type breakdown
const tweetTypeBreakdown = [
  { type: "Threads", count: 12, engagement: 12.1, color: "#8b5cf6" },
  { type: "Tips & Tutorials", count: 18, engagement: 14.3, color: "#22c55e" },
  { type: "Personal Stories", count: 8, engagement: 10.8, color: "#f59e0b" },
  { type: "Industry News", count: 15, engagement: 7.2, color: "#3b82f6" },
  { type: "Product Updates", count: 6, engagement: 9.5, color: "#ef4444" }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const currentFollowers = followerHistory[followerHistory.length - 1].followers;
  const weeklyGrowth = followerHistory.slice(-7).reduce((acc, day) => acc + day.net, 0);
  const avgEngagement = engagementTrends.reduce((acc, day) => acc + day.engagement_rate, 0) / engagementTrends.length;
  const totalTweetsThisWeek = engagementTrends.reduce((acc, day) => acc + day.tweets, 0);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "growing":
        return <Badge className="bg-green-100 text-green-700 border-green-200">📈 Growing</Badge>;
      case "stable":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">📊 Stable</Badge>;
      case "declining":
        return <Badge className="bg-red-100 text-red-700 border-red-200">📉 Declining</Badge>;
      default:
        return <Badge variant="secondary">📊 Unknown</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "thread": return "text-purple-600 bg-purple-50 border-purple-200";
      case "tip": return "text-green-600 bg-green-50 border-green-200";
      case "story": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your Twitter performance and growth</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 1. Account Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Account Overview</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={accountData.profile.avatar} />
                <AvatarFallback>{accountData.profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{accountData.profile.name}</h3>
                  {accountData.profile.verified && <span className="text-blue-500">✓</span>}
                  {getHealthBadge(accountData.accountHealth)}
                </div>
                <p className="text-muted-foreground mb-4">@{accountData.profile.username} • Joined {accountData.profile.joinDate}</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{accountData.currentStats.followers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{accountData.currentStats.following.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{accountData.currentStats.totalTweets.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Tweets</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Audience Insights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Audience Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Weekly Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{weeklyGrowth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Followers</p>
                  <p className="text-2xl font-bold">{currentFollowers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Gained This Week</p>
                  <p className="text-2xl font-bold">
                    +{followerHistory.slice(-7).reduce((acc, day) => acc + day.gained, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Lost This Week</p>
                  <p className="text-2xl font-bold">
                    -{followerHistory.slice(-7).reduce((acc, day) => acc + day.lost, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Follower Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Follower Growth Over Time</CardTitle>
              <CardDescription>Your audience growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={followerHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="followers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Net Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Net Growth</CardTitle>
              <CardDescription>Followers gained minus followers lost</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={followerHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="net" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Content Performance */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Content Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Avg Engagement</p>
                  <p className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Tweets This Week</p>
                  <p className="text-2xl font-bold">{totalTweetsThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Likes</p>
                  <p className="text-2xl font-bold">{topTweets.reduce((acc, t) => acc + t.metrics.likes, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Repeat2 className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-sm font-medium">Total Retweets</p>
                  <p className="text-2xl font-bold">{topTweets.reduce((acc, t) => acc + t.metrics.retweets, 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate Trend</CardTitle>
              <CardDescription>Average engagement per tweet over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement_rate" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Tweets */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tweets</CardTitle>
              <CardDescription>Your highest engagement posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTweets.map((tweet, index) => (
                  <div key={tweet.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 mb-2">{tweet.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{tweet.metrics.engagement_rate}% engagement</span>
                        <span>❤️ {tweet.metrics.likes}</span>
                        <span>🔄 {tweet.metrics.retweets}</span>
                        <Badge variant="outline" className={`${getTypeColor(tweet.type)} text-xs`}>
                          {tweet.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Account Analysis & Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Account Analysis & Highlights</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Posting Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Best Posting Times
              </CardTitle>
              <CardDescription>When your audience is most engaged</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bestPostingTimes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tweet Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tweet Type Performance
              </CardTitle>
              <CardDescription>How different content types perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tweetTypeBreakdown.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="font-medium">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{type.engagement}%</p>
                      <p className="text-xs text-muted-foreground">{type.count} tweets</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Quick Recommendations</CardTitle>
            <CardDescription>AI-powered insights to improve your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">High Impact</span>
                </div>
                <p className="text-sm text-green-700">Tips & tutorials get 2.1× more engagement. Increase this content type by 30%.</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Timing</span>
                </div>
                <p className="text-sm text-blue-700">Post more content at 9 AM - your best performing time slot.</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Growth</span>
                </div>
                <p className="text-sm text-purple-700">Your follower retention rate is 94.2% - excellent! Keep engaging with replies.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}