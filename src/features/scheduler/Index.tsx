import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Twitter,
  Linkedin
} from "lucide-react";
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace';
import { useSchedulerPosts, type SchedulerItem } from '@/features/scheduler/hooks/useSchedulerPosts';
import EditPost from '@/features/scheduler/components/EditPost';

export default function Scheduler() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<null | SchedulerItem>(null);
  const { workspaceId } = useActiveWorkspace();
  const { items, loading, update, remove } = useSchedulerPosts(workspaceId);

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

  const filteredTweets: SchedulerItem[] = useMemo(() => {
    const base = items || [];
    return base.filter((tweet) => {
      const typeMatch = filterType === "all" || tweet.source === filterType;
      const statusMatch = filterStatus === "all" || tweet.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [items, filterType, filterStatus]);

  const groupedTweets = filteredTweets.reduce((groups, tweet) => {
    const key = tweet.scheduledTime ? new Date(tweet.scheduledTime).toDateString() : 'Unscheduled';
    if (!groups[key]) groups[key] = [] as any;
    (groups[key] as any).push(tweet);
    return groups;
  }, {} as Record<string, SchedulerItem[]>);

  // Sort tweets within each group by time
  Object.keys(groupedTweets).forEach(date => {
    groupedTweets[date].sort((a, b) => {
      const aTime = a.scheduledTime ? new Date(a.scheduledTime).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduledTime ? new Date(b.scheduledTime).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  });

  const sortedGroups = useMemo(() => {
    return Object.entries(groupedTweets).sort(([a], [b]) => {
      const aTime = a === 'Unscheduled' ? Number.MAX_SAFE_INTEGER : new Date(a).getTime();
      const bTime = b === 'Unscheduled' ? Number.MAX_SAFE_INTEGER : new Date(b).getTime();
      return aTime - bTime;
    });
  }, [groupedTweets]);

  const handleDelete = async (id: string) => {
    await remove(id);
  };

  

  const openEdit = (item: SchedulerItem) => {
    setEditing(item);
    setEditOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: { content?: string; scheduled_at?: string | null }) => {
    await update(id, updates as any);
  };

  return (
    <>
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tweet List Grouped by Date */}
      <div className="space-y-6">
        {sortedGroups.map(([date, tweets]) => (
          <div key={date}>
            {/* Date Header */}
            <h3 className="mb-4 text-muted-foreground font-medium">
              {date === 'Unscheduled' 
                ? 'Unscheduled'
                : new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
            </h3>
            
            {/* Tweet Rows for this date */}
            <div className="space-y-1">
              {(() => {
                const now = new Date();
                const future = (tweets as SchedulerItem[]).filter(t => t.scheduledTime && new Date(t.scheduledTime) >= now && t.status === 'scheduled');
                future.sort((a, b) => new Date(a.scheduledTime as string).getTime() - new Date(b.scheduledTime as string).getTime());
                const nextScheduledId = future.length > 0 ? future[0].id : null;
                return (tweets as SchedulerItem[]).map((tweet) => {
                  const isNext = nextScheduledId !== null && tweet.id === nextScheduledId;
                  return (
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
                    <div className={`text-sm ${isNext ? "font-medium" : ""}`}>
                      {tweet.scheduledTime ? formatTime(tweet.scheduledTime) : '--:--'}
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
                      ${isNext ? "font-medium" : ""}
                      ${tweet.status === "draft" ? "italic" : ""}
                    `}>
                      {truncateMessage(tweet.content)}
                    </p>
                  </div>

                  {/* Status Badge (visible on hover or for pending items) */}
                  <div className={`
                    flex-shrink-0 transition-opacity duration-200
                    ${isNext ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}>
                    <Badge 
                      variant="outline" 
                      className={`
                        text-xs px-2 py-1
                        ${isNext ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                        ${tweet.status === "scheduled" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
                        ${tweet.status === "posted" ? "bg-green-100 text-green-700 border-green-200" : ""}
                        ${tweet.status === "draft" ? "bg-gray-100 text-gray-700 border-gray-200" : ""}
                      `}
                    >
                      {isNext ? "Next" : tweet.status}
                    </Badge>
                  </div>

                  

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      title="Edit"
                      onClick={() => openEdit(tweet)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      title="Delete"
                      onClick={() => handleDelete(tweet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">Loading schedule…</h3>
          </CardContent>
        </Card>
      )}
      {!loading && Object.keys(groupedTweets).length === 0 && (
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
    {editing && (
      <EditPost
        open={editOpen}
        onOpenChange={(o) => setEditOpen(o)}
        postId={editing.id}
        initialContent={editing.content}
        initialScheduledAt={editing.scheduledTime}
        status={editing.status as any}
        onSave={handleSaveEdit}
      />
    )}
  </>
  );
}