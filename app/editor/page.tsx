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
      <SubscriptionGuard>
        {/* Header */}
        <header className="flex items-center px-2 py-4 border-b border-orange-100">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CONTENT_CATEGORIES.map((cate) => (
                <Badge
                  key={cate.id}
                  variant={category === cate.id ? "default" : "secondary"}
                  className={`flex items-center gap-1 px-3 py-1 cursor-pointer whitespace-nowrap transition-colors ${
                    category === cate.id 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600" 
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                  }`}
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Powered by Social Fox AI
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Hi, I am your Social Media AI Assistant
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              I'm here to help you create engaging social media posts for X.
              From viral threads to professional updates, let's craft content that resonates with your audience.
            </p>
          </div>

          {/* Top Input Area */}
          <div className="mb-12">
            <div className="w-3/4 mx-auto">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything Social Fox AI..."
                  className="min-h-[140px] resize-none rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-200 shadow-sm"
                  disabled={isGenerating}
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-sm text-orange-600 hover:bg-orange-50">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attach
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-sm text-orange-600 hover:bg-orange-50">
                    <Mic className="h-4 w-4 mr-1" />
                    Upload Media
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!prompt.trim() || isGenerating}
                    size="icon"
                    className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 font-medium">
                Find Your Template Chats AI
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click on any template to get started instantly
              </p>
            </div>
            {/* Template Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {QUICK_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-orange-100 hover:border-orange-300 hover:scale-105"
                  onClick={() => handleTemplateSelect(template.prompt)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">{template.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {template.prompt}
                    </p>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600">
                      {template.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}