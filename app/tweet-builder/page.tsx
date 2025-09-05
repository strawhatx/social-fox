"use client";

import { useState, useEffect } from "react";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableTweet } from "@/components/tweet-composer";
import { Sparkles } from "lucide-react";
import TweetEditor from "@/components/tweet-editor";

export default function TweetBuilder() {
  const [viralSuggestions, setViralSuggestions] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/tweets');
        if (!res.ok) return;
        const data = await res.json();
        const suggestions = Array.isArray(data?.tweets)
          ? data.tweets.map((t: any) => String(t.text)).filter(Boolean)
          : [];
        if (isMounted && suggestions.length > 0) {
          setViralSuggestions(suggestions.slice(0, 100));
        }
      } catch (_) {}
    })();

    return () => { isMounted = false; };
  }, []);

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                  {viralSuggestions.map((suggestion, index) => (
                    <DraggableTweet
                      key={index}
                      tweet={suggestion}
                      source="AI Suggestions"
                    >
                      <Card
                        key={index}
                        className="border-purple-200 cursor-pointer hover:bg-purple-50 transition-colors group"
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