import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, Heart, Repeat2, Eye, BarChart3 } from "lucide-react";
import StatsCard from "@/components/StatCards";

export default function Dashboard() {
  const dailyStreak = 7;
  const weeklyGoal = 21;
  const currentWeekPosts = 15;
  
  const stats = [
    { title: "Total Likes", value: "2,847", change: "+12%", icon: <Heart className="h-5 w-5 text-red-500" /> },
    { title: "Retweets", value: "456", change: "+8%", icon: <Repeat2 className="h-5 w-5 text-green-500" /> },
    { title: "Potential Reach", value: "45.2K", change: "+15%", icon: <Eye className="h-5 w-5 text-blue-500" /> },
    { title: "Engagement Rate", value: "4.2%", change: "+2.1%", icon: <BarChart3 className="h-5 w-5 text-purple-500" /> }
  ];

  const suggestedTimes = [
    { time: "9:00 AM", day: "Today", optimal: true },
    { time: "1:00 PM", day: "Today", optimal: false },
    { time: "5:00 PM", day: "Today", optimal: true },
    { time: "9:00 AM", day: "Tomorrow", optimal: false },
  ];

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
              <p className="text-2xl font-semibold">{dailyStreak} days</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              On Fire! 🔥
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Progress</span>
              <span>{currentWeekPosts}/{weeklyGoal} posts</span>
            </div>
            <Progress value={(currentWeekPosts / weeklyGoal) * 100} className="h-2" />
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
            {suggestedTimes.map((suggestion, index) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}