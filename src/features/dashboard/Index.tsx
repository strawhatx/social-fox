import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, Heart, Repeat2, Eye, BarChart3 } from "lucide-react";
import StatsCard from "@/components/StatCards";
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace';
import { useSuggestedTimes } from '@/features/dashboard/hooks/useSuggestedTimes';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';

export default function Dashboard() {
  const { workspaceId } = useActiveWorkspace();
  const weeklyGoal = 21;
  const { loading: loadingStats, dailyStreak, currentWeekPosts, cards } = useDashboardStats(workspaceId);

  const stats = [
    { title: "Total Likes", value: cards?.totalLikes.value || '—', change: cards?.totalLikes.change || '+0%', icon: <Heart className="h-5 w-5 text-red-500" /> },
    { title: "Retweets", value: cards?.totalRetweets.value || '—', change: cards?.totalRetweets.change || '+0%', icon: <Repeat2 className="h-5 w-5 text-green-500" /> },
    { title: "Potential Reach", value: cards?.potentialReach.value || '—', change: cards?.potentialReach.change || '+0%', icon: <Eye className="h-5 w-5 text-blue-500" /> },
    { title: "Engagement Rate", value: cards?.engagementRate.value || '—', change: cards?.engagementRate.change || '+0%', icon: <BarChart3 className="h-5 w-5 text-purple-500" /> }
  ];

  const { times: suggestedTimes, loading: loadingSuggested } = useSuggestedTimes(workspaceId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your posting overview.
        </p>
      </div>

      {/* Posting Streak Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Posting Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily Streak</p>
              <p className="text-2xl font-semibold">{loadingStats ? '—' : `${dailyStreak} days`}</p>
            </div>
            {(() => {
              const pct = loadingStats ? 0 : Math.min(100, Math.round((currentWeekPosts / weeklyGoal) * 100));
              const status = pct >= 100
                ? { text: 'Goal met! 🎉', cls: 'bg-green-100 text-green-700' }
                : pct >= 75
                ? { text: 'On Fire! 🔥', cls: 'bg-green-100 text-green-700' }
                : pct >= 40
                ? { text: 'On Track', cls: 'bg-blue-100 text-blue-700' }
                : { text: 'Keep Going', cls: 'bg-amber-100 text-amber-700' };
              return (
                <Badge variant="secondary" className={status.cls}>
                  {loadingStats ? '—' : status.text}
                </Badge>
              );
            })()}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Progress</span>
              <span>{loadingStats ? '—' : currentWeekPosts}/{weeklyGoal} posts</span>
            </div>
            <Progress value={loadingStats ? 0 : (currentWeekPosts / weeklyGoal) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Suggested Posting Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Suggested Posting Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {!loadingSuggested && suggestedTimes.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  suggestion.optimal
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{suggestion.time}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.day}</p>
                  </div>
                  {suggestion.optimal && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Optimal
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {loadingSuggested && (
              <div className="text-sm text-muted-foreground">Loading suggestions…</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}