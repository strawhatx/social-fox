"use client";

import { useState } from "react";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTweet } from "@/components/tweet-composer";
import {
  Sparkles,
  Clock,
  Send,
  Copy,

} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TweetEditor from "@/components/tweet-editor";

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

  // Mentions temporarily removed

  return (
    <SidebarLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="flex h-full">
          {/* Left Panel - Content Sources with Tabs */}
          <div className="w-1/2 md:w-3/5 xl:w-3/4 border-r border-border p-4">
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
                    <DraggableTweet
                      key={index}
                      tweet={suggestion}
                      source="AI Suggestions"
                    >
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
                    </DraggableTweet>

                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Editor */}
          <div className="w-1/2 md:w-2/5 xl:w-1/4 max-w-full p-4 text-sm">
          <TweetEditor />
          </div>
        </div>
      </DndProvider>

    </SidebarLayout>
  );
}