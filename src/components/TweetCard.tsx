import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  GitCommit, 
  Sparkles, 
  MessageCircle, 
  MoreHorizontal,
  Copy,
  Edit3
} from "lucide-react";

interface TweetCardProps {
  tweet: {
    id: number;
    content: string;
    source: "commit" | "ai" | "conversation";
    hashtags?: string[];
  };
  onSelect?: (content: string) => void;
  variant?: "default" | "selectable";
}

export default function TweetCard({ tweet, onSelect, variant = "default" }: TweetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSourceIcon = () => {
    switch (tweet.source) {
      case "commit": return <GitCommit className="h-4 w-4 text-blue-600" />;
      case "ai": return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "conversation": return <MessageCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getSourceColor = () => {
    switch (tweet.source) {
      case "commit": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ai": return "bg-purple-100 text-purple-700 border-purple-200";
      case "conversation": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getBorderColor = () => {
    switch (tweet.source) {
      case "commit": return "border-blue-200";
      case "ai": return "border-purple-200";
      case "conversation": return "border-green-200";
    }
  };

  const getHoverColor = () => {
    switch (tweet.source) {
      case "commit": return "hover:bg-blue-50";
      case "ai": return "hover:bg-purple-50";
      case "conversation": return "hover:bg-green-50";
    }
  };

  const handleCardClick = () => {
    if (variant === "selectable" && onSelect) {
      onSelect(tweet.content);
    }
  };

  return (
    <Card
      className={`${getBorderColor()} ${variant === "selectable" ? `cursor-pointer ${getHoverColor()} transition-colors` : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSourceIcon()}
            <Badge variant="outline" className={getSourceColor()}>
              {tweet.source === "commit" ? "Commit" : 
               tweet.source === "ai" ? "AI" : "Reply"}
            </Badge>
          </div>
          {isHovered && variant === "default" && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost">
                <Copy className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost">
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-sm leading-relaxed">{tweet.content}</p>
        
        {tweet.hashtags && tweet.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tweet.hashtags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}