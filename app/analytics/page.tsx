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
import { ArrowLeft, TrendingUp,Eye,Heart,MessageCircle,Share2,Users,BarChart3,Calendar,ArrowUp,ArrowDown, FileText, List, Film, Image as ImageIcon, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("14d");
  const [analyticsData, setAnalyticsData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{ top_post?: any; bottom_post?: any; recommendations?: string[] } | null>(null);

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

  // Fetch insights (AI reasons/actions + recs)
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/analytics/insights?timeRange=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        } else {
          setInsights(null);
        }
      } catch {
        setInsights(null);
      }
    };
    fetchInsights();
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

  const postTypeBreakdown = [
    { label: "Short tweets", value: `${(analyticsData.breakdown?.shortTweets?.avgEngagement || 0).toFixed(1)}%`, icon: FileText, color: "text-gray-600" },
    { label: "Threads", value: `${(analyticsData.breakdown?.threads?.avgEngagement || 0).toFixed(1)}%`, icon: List, color: "text-gray-600" },
    { label: "Tweets with GIFs", value: `${(analyticsData.breakdown?.gifs?.avgEngagement || 0).toFixed(1)}%`, icon: Film, color: "text-gray-600" },
    { label: "Tweets with images", value: `${(analyticsData.breakdown?.images?.avgEngagement || 0).toFixed(1)}%`, icon: ImageIcon, color: "text-gray-600" },
  ];

  const heatmap = analyticsData.timing?.heatmap || [];
  const heatColor = (f: number) => {
    if (!f || f <= 0) return 'bg-gray-100';
    if (f < 0.9) return 'bg-gray-200';
    if (f < 1.1) return 'bg-orange-200';
    if (f < 1.4) return 'bg-orange-400';
    if (f < 1.8) return 'bg-orange-500';
    return 'bg-orange-700';
  };
  const dayShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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
                <h1 className="text-xl font-medium">Analytics</h1>
              </div>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
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
                    className="p-6 bg-white hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-md bg-gray-50 ${stat.color}`}>
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

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
     
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Performance Summary</h3>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">Last {timeRange === '14d' ? '14 days' : 'period'}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Post */}
                <div className="p-4 rounded-lg bg-green-50/70 border border-green-100">
                  <div className="flex items-center gap-2 text-xs text-green-700 mb-2">
                    <span>🔥 Top Post</span>
                  </div>
                  <p className="text-sm mb-3 line-clamp-3 text-green-900">{analyticsData.performanceSummary?.top?.content || '—'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-800">
                      {(() => {
                        const top = analyticsData.performanceSummary?.top?.engagement || 0;
                        const avg = analyticsData.stats.engagementRate || 0;
                        if (!top || !avg) return '';
                        const ratio = Math.max(0, Math.round((top / (avg || 1)) * 10) / 10);
                        return `${ratio}× higher engagement than average`;
                      })()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="text-xs bg-orange-600 hover:bg-orange-700 text-white">Generate more like this</Button>
                    </div>
                  </div>
                  {insights?.top_post?.reason && (
                    <div className="mt-3 text-xs text-green-900/80">
                      <div className="text-green-900/70">Why it worked:</div>
                      <div>{insights.top_post.reason}</div>
                      <div className="mt-1 text-green-900/70">Next step:</div>
                      <div>{insights.top_post.action}</div>
                    </div>
                  )}
                </div>

                {/* Lowest Post */}
                <div className="p-4 rounded-lg bg-red-50/70 border border-red-100">
                  <div className="flex items-center gap-2 text-xs text-red-700 mb-2">
                    <span>😴 Lowest Performing</span>
                  </div>
                  <p className="text-sm mb-3 line-clamp-3 text-red-900">{analyticsData.performanceSummary?.bottom?.content || '—'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-800">
                      {(() => {
                        const bottom = analyticsData.performanceSummary?.bottom?.engagement || 0;
                        const avg = analyticsData.stats.engagementRate || 0;
                        if (!bottom || !avg) return '';
                        const delta = Math.round(((bottom - avg) / (avg || 1)) * 100);
                        return `${Math.abs(delta)}% lower engagement`;
                      })()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Rework with AI rewrite</Button>
                    </div>
                  </div>
                  {insights?.bottom_post?.reason && (
                    <div className="mt-3 text-xs text-red-900/80">
                      <div className="text-red-900/70">Why it underperformed:</div>
                      <div>{insights.bottom_post.reason}</div>
                      <div className="mt-1 text-red-900/70">Fix:</div>
                      <div>{insights.bottom_post.action}</div>
                    </div>
                  )}
                </div>
              </div>
    
          </motion.div> 
          
          {/* Post-Type Breakdown, Timing Insight, Consistency, Action Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Post-Type Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
            <Card className="p-6 bg-white border border-gray-100 h-full">
              <h3 className="text-lg font-medium mb-6">Post-Type Breakdown</h3>
              <div className="space-y-6">
                {postTypeBreakdown.map((item, index) => {
                  const Icon = item.icon as any;
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
                      {index < postTypeBreakdown.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                })}
                {analyticsData.breakdown?.comparisonText && (
                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    {analyticsData.breakdown.comparisonText}
                  </div>
                )}
              </div>
            </Card>
            </motion.div>

            {/* Timing Insight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
            <Card className="p-6 bg-white border border-gray-100 h-full">
              <h3 className="text-lg font-medium mb-2">Best posting times</h3>
              <div className="text-sm mb-4 text-orange-700">
                {analyticsData.timing?.bestWindowText || '—'}
              </div>
              <div className="space-y-3 text-sm">
                {/* Heatmap grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 items-center">
                      <div />
                      {Array.from({ length: 24 }).map((_, h) => (
                        <div key={h} className="text-[10px] text-muted-foreground text-center">{h}</div>
                      ))}
                      {Array.from({ length: 7 }).map((_, d) => (
                        <>
                          <div key={`label-${d}`} className="text-xs text-muted-foreground pr-2">{dayShort[d]}</div>
                          {Array.from({ length: 24 }).map((_, h) => {
                            const cell = heatmap.find((c: any) => c.dayOfWeek === d && c.hour === h);
                            const f = cell?.factor || 0;
                            return (
                              <div
                                key={`c-${d}-${h}`}
                                className={`h-4 rounded ${heatColor(f)}`}
                                title={`${dayShort[d]} ${h}:00 • ${f}x`}
                              />
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Low</span>
                  <div className="h-3 w-4 rounded bg-gray-200" />
                  <div className="h-3 w-4 rounded bg-orange-200" />
                  <div className="h-3 w-4 rounded bg-orange-400" />
                  <div className="h-3 w-4 rounded bg-orange-500" />
                  <div className="h-3 w-4 rounded bg-orange-700" />
                  <span>High</span>
                </div>
              </div>
            </Card>
            </motion.div>

            {/* Consistency Meter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
            <Card className="p-6 bg-white border border-gray-100 h-full">
              <h3 className="text-lg font-medium mb-4">Consistency</h3>
              <div className="text-sm space-y-4">
                {analyticsData.consistency?.streakDays && analyticsData.consistency.streakDays > 1 ? (
                  <div className="flex items-center gap-2 text-green-800">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Streak: {analyticsData.consistency.streakDays} days in a row</span>
                  </div>
                ) : (
                  <div className="text-amber-800">
                    {`Missed ${analyticsData.consistency?.missedDaysThisWeek ?? 0} days this week — want a reminder system?`}
                  </div>
                )}
                {/* Week activity dots */}
                <div>
                  <div className="flex items-center gap-2">
                    {(analyticsData.consistency?.weekActivity || []).map((d, i) => (
                      <div key={i} className={`h-3.5 w-3.5 rounded-full border ${d.posted ? 'bg-orange-500 border-orange-500' : 'bg-gray-100 border-gray-200'}`} title={`${d.date} • ${d.posted ? 'Posted' : 'No post'}`} />
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Last 7 days</div>
                </div>
                {/* Weekly progress */}
                <div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, (analyticsData.consistency?.daysPostedThisWeek || 0) / 7 * 100))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{analyticsData.consistency?.daysPostedThisWeek || 0}/7 days this week</div>
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
            <Card className="p-6 bg-white border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Top Performing Posts</h3>
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
                    className="p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all cursor-pointer"
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
                            <span>{Number(post.views|| 0).toLocaleString()}</span>
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

          

          {/* Action Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Card className="p-6 bg-white border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Action Center</h3>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {(insights?.recommendations || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Card>
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
              <Card className="p-6 bg-white border border-gray-100">
                <h3 className="text-lg font-medium mb-6">Engagement Over Time</h3>
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
              <Card className="p-6 bg-white border border-gray-100">
                <h3 className="text-lg font-medium mb-6">Engagement Breakdown</h3>
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


       
        </div>
      </div>
    </div>
  );
}
