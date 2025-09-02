import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { 
  MessageCircle, 
  Heart, 
  Repeat2, 
  Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConversationsProps {
  onViewDetails: (tweet: any) => void;
}

export default function Conversations({ onViewDetails }: ConversationsProps) {
  const [filterTag, setFilterTag] = useState("");

  const trendingTweets = [
    {
      id: 1,
      author: "@techguru_dev",
      content: "Just discovered this amazing new React hook that solves state management issues. The developer experience is incredible! 🚀",
      likes: 245,
      retweets: 89,
      replies: 34,
      hashtags: ["#React", "#WebDev", "#JavaScript"],
      engagement: "high"
    },
    {
      id: 2,
      author: "@startup_founder",
      content: "Building in public is terrifying but so rewarding. Today we hit 1000 users! The feedback has been incredible. What's your experience with transparency in business?",
      likes: 892,
      retweets: 156,
      replies: 78,
      hashtags: ["#BuildInPublic", "#Startup", "#Entrepreneurship"],
      engagement: "viral"
    },
    {
      id: 3,
      author: "@design_wizard",
      content: "Hot take: The best UX is invisible. When users don't even notice your interface, you've won. What are your thoughts on minimal design? 🎨",
      likes: 423,
      retweets: 67,
      replies: 45,
      hashtags: ["#UX", "#Design", "#Minimalism"],
      engagement: "medium"
    },
    {
      id: 4,
      author: "@ai_researcher",
      content: "The pace of AI development is mind-blowing. What we thought would take years is happening in months. Are we prepared for this acceleration?",
      likes: 678,
      retweets: 234,
      replies: 123,
      hashtags: ["#AI", "#MachineLearning", "#Future"],
      engagement: "high"
    },
    {
      id: 5,
      author: "@productivity_pro",
      content: "Tried the Pomodoro technique for a week. Results: 40% more focused work, less decision fatigue, better work-life balance. Simple tools, big impact! ⏰",
      likes: 334,
      retweets: 98,
      replies: 56,
      hashtags: ["#Productivity", "#TimeManagement", "#WorkLife"],
      engagement: "medium"
    }
  ];

  const handleViewDetails = (tweet: any) => {
    onViewDetails(tweet);
    toast({
      title: "Loading tweet details...",
      description: "View the full conversation thread and engagement insights."
    });
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "viral": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredTweets = filterTag 
    ? trendingTweets.filter(tweet => 
        tweet.hashtags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      )
    : trendingTweets;

  return (
    <div className="p-4 space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-green-600">Trending Conversations</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by hashtag..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="pl-8 w-48"
            />
          </div>
        </div>
      </div>

      {/* Trending Tweets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTweets.map((tweet) => (
          <Card key={tweet.id} className="border-green-200 hover:bg-green-50 transition-colors h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{tweet.author}</span>
                  <Badge 
                    variant="outline" 
                    className={`${getEngagementColor(tweet.engagement)} flex-shrink-0`}
                  >
                    {tweet.engagement}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(tweet)}
                  className="border-green-200 text-green-700 hover:bg-green-100 flex-shrink-0"
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed line-clamp-4">{tweet.content}</p>
              
              <div className="flex flex-wrap gap-1">
                {tweet.hashtags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-green-100 text-green-700"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{tweet.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="h-4 w-4" />
                  <span>{tweet.retweets}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{tweet.replies}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTweets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No conversations found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filter or check back later for new trending conversations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}