"use client";

import { useState } from "react";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import HashtagPicker from "@/components/hashtag-picker";
import MentionPicker from "@/components/mention-picker";

import {
  Sparkles,
  Clock,
  Send,
  Copy,
  
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TweetBuilder() {
  const [selectedTweet, setSelectedTweet] = useState("");
  const [editedTweet, setEditedTweet] = useState("");
  // suggestion state lifted to components; only insertion logic remains here

  const viralSuggestions = [
    "The best developers aren't the ones who never make mistakes—they're the ones who learn from them the fastest. 🧠💡",
    "Hot take: Reading other people's code is more valuable than writing your own. Change my mind. 🤔",
    "PSA: Your side project doesn't need to be the next unicorn startup. Sometimes it's just for fun, and that's perfectly okay. ✨",
    "Debugging is like being a detective in a crime movie where you're also the murderer. 🔍😅",
    "The moment when your code works on the first try: 🎉 The moment when you realize you forgot to save: 😭",
    "Reminder: Imposter syndrome is just your brain's way of saying you're growing. Keep pushing! 💪",
    "Code review tip: Be kind. Remember, there's a human behind every line of code. 💝",
    "That feeling when you delete more lines than you add and the app works better 📉➡️📈",
    "Documentation is love letters to your future self. Write them. ❤️",
    "Pro tip: The best code is the code you don't have to write. Simplicity wins every time. ⭐"
  ];

  const handleTweetSelect = (tweet: string) => {
    setSelectedTweet(tweet);
    setEditedTweet(tweet);
    toast({
      title: "Tweet selected!",
      description: "You can now edit and customize the tweet."
    });
  };

  const handlePostNow = () => {
    if (!editedTweet.trim()) return;
    toast({
      title: "Tweet posted!",
      description: "Your tweet has been published successfully."
    });
    setEditedTweet("");
    setSelectedTweet("");
  };

  const handleSchedule = () => {
    if (!editedTweet.trim()) return;
    toast({
      title: "Tweet scheduled!",
      description: "Your tweet has been added to the scheduler."
    });
    setEditedTweet("");
    setSelectedTweet("");
  };

  const addHashtag = () => {
    // Kept for manual insertion fallback
    setEditedTweet(prev => prev + " #");
  };

  const addMention = () => {
    setEditedTweet(prev => prev + " @");
  };

  // fetching is handled inside HashtagPicker/MentionPicker

  const handleInsertHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? cleanTag : ` ${cleanTag}`;
    const next = editedTweet + addition;
    if (next.length > 280) {
      toast({
        title: "Too long",
        description: "Adding this hashtag would exceed 280 characters.",
      });
      return;
    }
    setEditedTweet(next);
  };

  const handleInsertMention = (handle: string) => {
    const clean = handle.startsWith('@') ? handle : `@${handle}`;
    const addition = (editedTweet.endsWith(' ') || editedTweet.length === 0) ? clean : ` ${clean}`;
    const next = editedTweet + addition;
    if (next.length > 280) {
      toast({
        title: "Too long",
        description: "Adding this mention would exceed 280 characters.",
      });
      return;
    }
    setEditedTweet(next);
  };

  return (
    <SidebarLayout>
    <div className="flex h-full">
      {/* Left Panel - Content Sources with Tabs */}
      <div className="w-2/3 border-r border-border p-4">
        <Tabs defaultValue="ai-suggestions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-suggestions" className="flex-1 mt-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-600">AI Viral Suggestions</h3>
              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 text-xs">
                {viralSuggestions.length} suggestions
              </Badge>
            </div>

            <div className="space-y-3 overflow-y-auto">
              {viralSuggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="border-purple-200 cursor-pointer hover:bg-purple-50 transition-colors group"
                  onClick={() => handleTweetSelect(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                        AI
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{suggestion}</p>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-purple-600">
                        Use this tweet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Editor */}
      <div className="w-1/3 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <h2>Tweet Editor</h2>
          {selectedTweet && (
            <Badge variant="outline" className="text-xs text-green-700 bg-green-50 border-green-200">
              Tweet selected
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Compose Tweet</span>
              <span className={`text-sm ${editedTweet.length > 250 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {editedTweet.length}/280
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Select a tweet from the tabs above or write your own..."
              value={editedTweet}
              onChange={(e) => setEditedTweet(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={280}
            />

            <div className="flex items-center gap-2">
              <HashtagPicker
                content={editedTweet || selectedTweet || ""}
                onInsert={handleInsertHashtag}
                onAddManual={addHashtag}
              />
              <MentionPicker
                content={editedTweet || selectedTweet || ""}
                onInsert={handleInsertMention}
                onAddManual={addMention}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button
                className="flex-1"
                disabled={!editedTweet.trim()}
                onClick={handlePostNow}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Now
              </Button>
              <Button
                variant="outline"
                disabled={!editedTweet.trim()}
                onClick={handleSchedule}
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedTweet && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Original Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedTweet}</p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 h-6 text-xs"
                onClick={() => {
                  setEditedTweet(selectedTweet);
                  toast({
                    title: "Tweet restored",
                    description: "Original tweet content restored to editor."
                  });
                }}
              >
                Restore original
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
}