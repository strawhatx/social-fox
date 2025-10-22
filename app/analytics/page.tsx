'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Analytics } from "@/lib/types/analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { ArrowLeft, TrendingUp,Eye,Heart,MessageCircle,Share2,Users,BarChart3,Calendar,ArrowUp,ArrowDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Posts",
      value: analyticsData.stats.totalPosts.toString(),
      change: "+15%", // TODO: Calculate actual change
      trend: "up",
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      label: "Total Impressions",
      value: formatNumber(analyticsData.stats.totalImpressions),
      change: "+23%", // TODO: Calculate actual change
      trend: "up",
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Engagement Rate",
      value: `${analyticsData.stats.engagementRate}%`,
      change: "+0.4%", // TODO: Calculate actual change
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Total Followers",
      value: formatNumber(analyticsData.stats.totalFollowers),
      change: "+12%", // TODO: Calculate actual change
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  const engagementBreakdown = [
    { label: "Likes", value: analyticsData.stats.totalLikes.toString(), icon: Heart, color: "text-red-500" },
    { label: "Retweets", value: analyticsData.stats.totalRetweets.toString(), icon: Share2, color: "text-green-500" },
    { label: "Comments", value: analyticsData.stats.totalComments.toString(), icon: MessageCircle, color: "text-blue-500" },
    { label: "Bookmarks", value: analyticsData.stats.totalBookmarks.toString(), icon: Heart, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-orange-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h1 className="text-lg">Analytics</h1>
              </div>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${
                          stat.trend === "up"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {stat.change}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl">{stat.value}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 bg-white">
                <h3 className="text-lg mb-6">Engagement Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.engagementData}>
                    <defs>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient
                        id="colorComments"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="likes"
                      stroke="#f97316"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLikes)"
                    />
                    <Area
                      type="monotone"
                      dataKey="retweets"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorComments)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600" />
                    <span className="text-sm text-muted-foreground">Likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-sm text-muted-foreground">
                      Retweets
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Engagement Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white">
                <h3 className="text-lg mb-6">Engagement Breakdown</h3>
                <div className="space-y-6">
                  {engagementBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-sm text-muted-foreground">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-lg">{item.value}</span>
                        </div>
                        {index < engagementBreakdown.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Interactions</span>
                      <span className="text-lg">
                        {analyticsData.stats.totalLikes + analyticsData.stats.totalRetweets + analyticsData.stats.totalComments + analyticsData.stats.totalBookmarks}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>


          {/* Top Performing Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg">Top Performing Posts</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Best of the month
                </Badge>
              </div>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 rounded-lg border hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="bg-orange-600 text-white"
                          >
                            #{index + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.date)}
                          </span>
                        </div>
                        <p className="text-sm mb-3 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            <span>{post.retweets}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.bookmarks}</span>
                          </div>
                          <Separator orientation="vertical" className="h-3" />
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Engagement
                        </div>
                        <div className="text-lg text-green-600">
                          {post.engagement}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
