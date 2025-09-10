"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { QUICK_TEMPLATES } from "@/lib/copilot";
import { BookOpen, Loader2, MessageSquare, Mic, Paperclip, Plus, Rocket, Send, TrendingUp, Users, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_CATEGORIES = [
  { id: 'engagement', label: 'Engagement', icon: MessageSquare, active: true },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'educational', label: 'Educational', icon: BookOpen },
  { id: 'launches', label: 'Launches', icon: Rocket },
];

interface Template {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export default function TweetBuilder() {
  const router = useRouter();
  const [category, setCategory] = useState('engagement');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Create a new conversation with the question as the title (clipped) and first message
      const conversationTitle = prompt.trim().slice(0, 50) + (prompt.trim().length > 50 ? '...' : '');
      
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: conversationTitle,
          firstMessage: {
            role: 'user',
            content: prompt.trim()
          }
        })
      });

      if (!conversationResponse.ok) {
        throw new Error('Failed to create conversation');
      }

      const conversation = await conversationResponse.json();

      // Navigate to the conversation page with a flag to generate assistant response
      router.push(`/editor/${conversation.id}?generate=true`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Handle error - maybe show a toast or error message
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <SidebarLayout>
      {/* Header */}
      <header className="border-b bg-background px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CONTENT_CATEGORIES.map((cate) => (
              <Badge
                key={cate.id}
                variant={category === cate.id ? "default" : "secondary"}
                className="flex items-center gap-1 px-3 py-1 cursor-pointer whitespace-nowrap"
                onClick={() => setCategory(cate.id)}
              >
                <cate.icon className="h-3 w-3" />
                {cate.label}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-foreground mb-4">
            Hi, I am your Social Media AI Assistant
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            I'm here to help you create engaging social media posts for Twitter and LinkedIn. 
            From viral threads to professional updates, let's craft content that resonates with your audience.
          </p>
        </div>

        {/* Template Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {QUICK_TEMPLATES.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTemplateSelect(template.prompt)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">{template.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.prompt}
                </p>
                <Badge variant="outline" className="mt-3">
                  {template.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
          
          {/* Create with AI Card */}
          <Card className="border-dashed border-2 border-primary/30 bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Create with AI</h3>
                <p className="text-sm text-muted-foreground">
                  Let's create with the power of AI.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What would you like to post about?"
              className="min-h-[60px] pr-24 resize-none rounded-xl border-border"
              disabled={isGenerating}
            />
            
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!prompt.trim() || isGenerating}
                size="icon"
                className="h-8 w-8"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Social Fox can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}