import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Edit3,
  Trash2,
  GitCommit,
  Sparkles,
  MessageCircle,
  GripVertical,
  Twitter,
  Linkedin
} from "lucide-react";

export default function Scheduler() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const scheduledTweets = [
    {
      id: 1,
      content: "🚀 Just shipped user authentication! Finally, your data is safe and sound. #WebDev #Security",
      source: "commit",
      platform: "twitter",
      scheduledTime: "2025-01-01T09:00:00",
      status: "pending",
      engagement: { likes: 0, retweets: 0, replies: 0 }
    },
    {
      id: 2,
      content: "The best developers aren't the ones who never make mistakes—they're the ones who learn from them the fastest. 🧠💡",
      source: "ai",
      platform: "twitter",
      scheduledTime: "2025-01-01T13:00:00",
      status: "scheduled",
      engagement: { likes: 0, retweets: 0, replies: 0 }
    },
    {
      id: 3,
      content: "@startup_founder That's such an inspiring journey! Building in public takes real courage. What's been your biggest learning so far?",
      source: "conversation",
      platform: "twitter",
      scheduledTime: "2025-01-01T17:00:00",
      status: "scheduled",
      engagement: { likes: 0, retweets: 0, replies: 0 }
    },
    {
      id: 4,
      content: "📱 Fixed those pesky mobile bugs! Your app now looks perfect on every device. #ResponsiveDesign",
      source: "commit",
      platform: "linkedin",
      scheduledTime: "2024-12-31T15:30:00",
      status: "posted",
      engagement: { likes: 45, retweets: 12, replies: 8 }
    },
    {
      id: 5,
      content: "Documentation is love letters to your future self. Write them. ❤️",
      source: "ai",
      platform: "twitter",
      scheduledTime: "2024-12-31T11:00:00",
      status: "posted",
      engagement: { likes: 89, retweets: 23, replies: 15 }
    },
    {
      id: 6,
      content: "Hot take: Reading other people's code is more valuable than writing your own. Change my mind. 🤔 #CodeReview",
      source: "ai",
      platform: "twitter",
      scheduledTime: "2025-01-02T10:00:00",
      status: "draft",
      engagement: { likes: 0, retweets: 0, replies: 0 }
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter className="h-4 w-4 text-blue-500" />;
      case "linkedin": return <Linkedin className="h-4 w-4 text-blue-600" />;
      default: return <Twitter className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getRowStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "font-medium text-foreground"; // Bold for pending/next up
      case "scheduled":
        return "text-muted-foreground"; // Dimmed for scheduled
      case "posted":
        return "text-muted-foreground opacity-75"; // More dimmed for posted
      case "draft":
        return "text-muted-foreground italic"; // Italic and dimmed for drafts
      default:
        return "text-foreground";
    }
  };

  const filteredTweets = scheduledTweets.filter(tweet => {
    const typeMatch = filterType === "all" || tweet.source === filterType;
    const statusMatch = filterStatus === "all" || tweet.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const groupedTweets = filteredTweets.reduce((groups, tweet) => {
    const date = new Date(tweet.scheduledTime).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(tweet);
    return groups;
  }, {} as Record<string, typeof scheduledTweets>);

  // Sort tweets within each group by time
  Object.keys(groupedTweets).forEach(date => {
    groupedTweets[date].sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2>Scheduler & Queue</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="commit">Commits</SelectItem>
              <SelectItem value="ai">AI Generated</SelectItem>
              <SelectItem value="conversation">Conversations</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tweet List Grouped by Date */}
      <div className="space-y-6">
        {Object.entries(groupedTweets).map(([date, tweets]) => (
          <div key={date}>
            {/* Date Header */}
            <h3 className="mb-4 text-muted-foreground font-medium">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            
            {/* Tweet Rows for this date */}
            <div className="space-y-1">
              {tweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className={`
                    group flex items-center gap-4 p-3 rounded-lg transition-all duration-200
                    hover:bg-muted/50 hover:shadow-sm border border-transparent hover:border-border/50
                    cursor-pointer ${getRowStyle(tweet.status)}
                  `}
                >
                  {/* Time Only (since date is in header) */}
                  <div className="w-16 flex-shrink-0">
                    <div className={`text-sm ${tweet.status === "pending" ? "font-medium" : ""}`}>
                      {formatTime(tweet.scheduledTime)}
                    </div>
                  </div>

                  {/* Platform Icon */}
                  <div className="flex-shrink-0">
                    {getPlatformIcon(tweet.platform)}
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 min-w-0">
                    <p className={`
                      text-sm leading-relaxed truncate
                      ${tweet.status === "pending" ? "font-medium" : ""}
                      ${tweet.status === "draft" ? "italic" : ""}
                    `}>
                      {truncateMessage(tweet.content)}
                    </p>
                  </div>

                  {/* Status Badge (visible on hover or for pending items) */}
                  <div className={`
                    flex-shrink-0 transition-opacity duration-200
                    ${tweet.status === "pending" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}>
                    <Badge 
                      variant="outline" 
                      className={`
                        text-xs px-2 py-1
                        ${tweet.status === "pending" ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                        ${tweet.status === "scheduled" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
                        ${tweet.status === "posted" ? "bg-green-100 text-green-700 border-green-200" : ""}
                        ${tweet.status === "draft" ? "bg-gray-100 text-gray-700 border-gray-200" : ""}
                      `}
                    >
                      {tweet.status === "pending" ? "Next" : tweet.status}
                    </Badge>
                  </div>

                  {/* Drag Handle (visible on hover) */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing hover:bg-muted"
                      title="Drag to reschedule"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(groupedTweets).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No tweets found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or create some tweets in the Tweet Builder.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}