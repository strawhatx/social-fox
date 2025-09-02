import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

import {
  GitCommit,
  Sparkles,
  Clock,
  Send,
  Copy,
  Hash,
  AtSign,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TweetBuilder() {
  const [selectedTweet, setSelectedTweet] = useState("");
  const [editedTweet, setEditedTweet] = useState("");

  const commitTweets = [
    {
      id: 1,
      commit: "feat: Add user authentication system",
      suggestions: [
        "🚀 Just shipped user authentication! Finally, your data is safe and sound. #WebDev #Security",
        "New feature alert! 🔐 Added user authentication to keep your information secure. Building trust, one commit at a time.",
        "Authentication system is live! 💪 Users can now sign up, log in, and feel confident their data is protected."
      ]
    },
    {
      id: 2,
      commit: "fix: Resolve mobile responsive issues",
      suggestions: [
        "📱 Fixed those pesky mobile bugs! Your app now looks perfect on every device. #ResponsiveDesign",
        "Mobile experience just got a major upgrade! 🎯 No more zooming and squinting.",
        "Bug squashed! 🐛➡️✨ Mobile users, you're gonna love this update."
      ]
    },
    {
      id: 3,
      commit: "refactor: Optimize database queries for better performance",
      suggestions: [
        "⚡ Database queries are now lightning fast! Performance optimization complete. #Performance",
        "Speed matters! 🏃‍♂️ Just optimized our database queries for 3x faster load times."
      ]
    }
  ];

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
    setEditedTweet(prev => prev + " #");
  };

  const addMention = () => {
    setEditedTweet(prev => prev + " @");
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Content Sources with Tabs */}
      <div className="w-2/3 border-r border-border p-4">
        <Tabs defaultValue="commits" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="commits" className="flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              Commits
            </TabsTrigger>
            <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commits" className="flex-1 mt-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GitCommit className="h-5 w-5 text-blue-600" />
              <h3 className="text-blue-600">Commit-Based Tweets</h3>
              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                {commitTweets.length} commits
              </Badge>
            </div>

            <div className="space-y-4 overflow-y-auto">
              {commitTweets.map((item) => (
                <Card key={item.id} className="border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        Commit
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {item.commit}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-3 border border-blue-100 rounded-md cursor-pointer hover:bg-blue-50 transition-colors group"
                        onClick={() => handleTweetSelect(suggestion)}
                      >
                        <p className="text-sm leading-relaxed">{suggestion}</p>
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-600">
                            Use this tweet
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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
              <Button
                size="sm"
                variant="outline"
                onClick={addHashtag}
                className="flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                Hashtag
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addMention}
                className="flex items-center gap-1"
              >
                <AtSign className="h-3 w-3" />
                Mention
              </Button>
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
  );
}