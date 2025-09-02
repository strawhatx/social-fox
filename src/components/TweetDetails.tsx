import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { 
  ArrowLeft,
  Heart, 
  Repeat2, 
  MessageCircle,
  Share,
  TrendingUp,
  Users,
  Tag
} from "lucide-react";

interface TweetDetailsProps {
  tweet: any;
  onBack: () => void;
}

export default function TweetDetails({ tweet, onBack }: TweetDetailsProps) {
  const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likes);
  const [retweetCount, setRetweetCount] = useState(tweet.retweets);

  const replies = [
    {
      id: 1,
      author: "@dev_sarah",
      avatar: "S",
      content: "This is so true! I've learned more from debugging other people's code than from writing my own.",
      likes: 23,
      retweets: 5,
      replies: 2,
      timestamp: "2h ago"
    },
    {
      id: 2,
      author: "@codemaster_john",
      avatar: "J",
      content: "Absolutely agree! Code review sessions are like mini masterclasses.",
      likes: 15,
      retweets: 3,
      replies: 1,
      timestamp: "1h ago",
      isReplyToFirst: true
    },
    {
      id: 3,
      author: "@junior_dev_alex",
      avatar: "A",
      content: "As a junior dev, I can confirm this. Reading senior developers' code has taught me so much about clean architecture and best practices.",
      likes: 45,
      retweets: 12,
      replies: 8,
      timestamp: "45m ago"
    },
    {
      id: 4,
      author: "@tech_lead_maria",
      avatar: "M",
      content: "This is why I always encourage my team to do code reviews together. It's a learning opportunity for everyone involved.",
      likes: 67,
      retweets: 18,
      replies: 12,
      timestamp: "30m ago"
    }
  ];

  const suggestedHashtags = ["#CodeReview", "#WebDev", "#Programming", "#BestPractices", "#Learning"];

  const contextInfo = {
    reason: "Suggested because it's trending in #WebDev community with high engagement",
    relevantTopics: ["Code Review", "Software Development", "Learning"],
    engagementPotential: "High - controversial topic with strong opinions"
  };

  const handleLikeReply = (replyId: number) => {
    setLikedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
        toast.success("Like removed");
      } else {
        newSet.add(replyId);
        toast.success("Reply liked!");
      }
      return newSet;
    });
  };

  const handleRetweetReply = (replyAuthor: string) => {
    toast.success("Reply retweeted!", {
      description: `You retweeted ${replyAuthor}'s reply`
    });
  };

  const handleReplyToReply = (replyAuthor: string) => {
    toast.info("Opening reply composer...", {
      description: `Replying to ${replyAuthor}`
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast.success(isLiked ? "Like removed" : "Tweet liked!", {
      description: "Engagement tracked in your analytics."
    });
  };

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    setRetweetCount(prev => isRetweeted ? prev - 1 : prev + 1);
    toast.success(isRetweeted ? "Retweet removed" : "Tweet retweeted!", {
      description: "Your retweet has been published."
    });
  };

  const handleReply = () => {
    toast.info("Opening reply composer...", {
      description: "This would open Twitter's reply interface."
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this tweet: ${tweet.content}`);
    toast.success("Tweet link copied to clipboard!");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Conversations
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Tweet Card */}
          <Card className="border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-green-100">
                  <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                    {tweet.author.charAt(1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{tweet.author}</span>
                    <Badge 
                      variant="outline" 
                      className={`font-medium ${tweet.engagement === "viral" ? "bg-red-100 text-red-700 border-red-200" : 
                        tweet.engagement === "high" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-yellow-100 text-yellow-700 border-yellow-200"}`}
                    >
                      {tweet.engagement}
                    </Badge>
                  </div>
                  
                  <p className="text-lg leading-relaxed">{tweet.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {tweet.hashtags?.map((tag: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(tag);
                          toast.success("Hashtag copied!");
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-8 pt-4 border-t border-green-100">
                    <button 
                      className={`flex items-center gap-2 hover:text-red-500 transition-all duration-200 group px-2 py-1 rounded-md hover:bg-red-50 ${
                        isLiked ? 'text-red-500 bg-red-50' : 'text-muted-foreground'
                      }`}
                      onClick={handleLike}
                    >
                      <Heart className={`h-5 w-5 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
                      <span className="font-medium">{likeCount}</span>
                    </button>
                    <button 
                      className={`flex items-center gap-2 hover:text-green-500 transition-all duration-200 group px-2 py-1 rounded-md hover:bg-green-50 ${
                        isRetweeted ? 'text-green-500 bg-green-50' : 'text-muted-foreground'
                      }`}
                      onClick={handleRetweet}
                    >
                      <Repeat2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{retweetCount}</span>
                    </button>
                    <button 
                      className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-all duration-200 group px-2 py-1 rounded-md hover:bg-blue-50"
                      onClick={handleReply}
                    >
                      <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{tweet.replies}</span>
                    </button>
                    <button 
                      className="flex items-center gap-2 text-muted-foreground hover:text-purple-500 transition-all duration-200 group px-2 py-1 rounded-md hover:bg-purple-50"
                      onClick={handleShare}
                    >
                      <Share className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Replies Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Replies ({replies.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {replies.map((reply, index) => (
                <div key={reply.id}>
                  <div className={`flex items-start gap-3 ${reply.isReplyToFirst ? 'ml-8' : ''}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {reply.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{reply.content}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <button 
                          className={`flex items-center gap-1 hover:text-red-500 transition-all duration-200 group px-1.5 py-1 rounded hover:bg-red-50 ${
                            likedReplies.has(reply.id) ? 'text-red-500 bg-red-50' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleLikeReply(reply.id)}
                        >
                          <Heart className={`h-3 w-3 group-hover:scale-110 transition-transform ${likedReplies.has(reply.id) ? 'fill-current' : ''}`} />
                          <span className="font-medium">{reply.likes + (likedReplies.has(reply.id) ? 1 : 0)}</span>
                        </button>
                        <button 
                          className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-all duration-200 group px-1.5 py-1 rounded hover:bg-green-50"
                          onClick={() => handleRetweetReply(reply.author)}
                        >
                          <Repeat2 className="h-3 w-3 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{reply.retweets}</span>
                        </button>
                        <button 
                          className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-all duration-200 group px-1.5 py-1 rounded hover:bg-blue-50"
                          onClick={() => handleReplyToReply(reply.author)}
                        >
                          <MessageCircle className="h-3 w-3 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{reply.replies}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < replies.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Engagement Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Engagement Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="p-2 bg-green-50 rounded-md">
                <p>💡 Ask questions to boost engagement</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md">
                <p>🤝 Share your own experience</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-md">
                <p>📊 Add relevant data or insights</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-md">
                <p>🎯 Be authentic and helpful</p>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Suggested Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-100"
                    onClick={() => {
                      navigator.clipboard.writeText(tag);
                      toast.success("Hashtag copied!");
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Context Block */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Why This Tweet?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Suggestion Reason:</p>
                <p>{contextInfo.reason}</p>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground mb-1">Relevant Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {contextInfo.relevantTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-muted-foreground mb-1">Engagement Potential:</p>
                <p>{contextInfo.engagementPotential}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}