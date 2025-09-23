"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from '@/components/sidebar-layout';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import SubscriptionGuard from "@/components/subscription/subscription-guard";
import { QUICK_TEMPLATES } from "@/lib/copilot";
import { 
  BookOpen, 
  Loader2, 
  MessageSquare, 
  Mic, 
  Paperclip, 
  Plus, 
  Rocket, 
  Send, 
  TrendingUp, 
  Users, 
  Zap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Sparkles
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_CATEGORIES = [
  { id: 'engagement', label: 'Engagement', icon: MessageSquare, active: true },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'educational', label: 'Educational', icon: BookOpen },
  { id: 'launches', label: 'Launches', icon: Rocket },
];

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
}

export default function TweetBuilder() {
  const router = useRouter();
  const [category, setCategory] = useState('engagement');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConversationsSidebarOpen, setIsConversationsSidebarOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/editor/${conversationId}`);
  };

  const handleNewConversation = () => {
    setIsConversationsSidebarOpen(false);
    // The existing handleSend function will create a new conversation
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;
  
    setIsGenerating(true);
  
    try {
      // Create new empty conversation
      const conversationResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!conversationResponse.ok) throw new Error('Failed to create conversation');
  
      const conversation = await conversationResponse.json();
  
      // Refresh sidebar list
      await fetchConversations();
  
      // Navigate to editor with message in URL
      const encodedMessage = encodeURIComponent(prompt.trim());
      router.push(`/editor/${conversation.id}?message=${encodedMessage}`);
    } 
    catch (error) {
      console.error('Error starting conversation:', error);
    } 
    finally {
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

  // Conversations Sidebar Component
  const ConversationsSidebar = () => {
    if (!isConversationsSidebarOpen) {
      return (
        <div className="w-16 border-r border-orange-200 bg-orange-50/50 flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsConversationsSidebarOpen(true)}
            className="w-10 h-10 mb-4 hover:bg-orange-100"
          >
            <ChevronRight className="h-5 w-5 text-orange-600" />
          </Button>
          <div className="flex flex-col items-center space-y-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversation}
              className="w-10 h-10 hover:bg-orange-100"
            >
              <Plus className="h-5 w-5 text-orange-600" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-80 border-r border-orange-200 bg-orange-50/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                <p className="text-xs text-orange-600">AI Post Co-Pilot</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsConversationsSidebarOpen(false)}
              className="h-8 w-8 hover:bg-orange-100"
            >
              <ChevronLeft className="h-4 w-4 text-orange-600" />
            </Button>
          </div>
          
          <Button
            onClick={handleNewConversation}
            className="w-full justify-start gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400">Start a new conversation to get started</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="group relative cursor-pointer transition-all hover:bg-orange-100/50 border-orange-200 hover:border-orange-300"
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                          <h3 className="text-sm font-medium truncate text-gray-900">
                            {conversation.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-orange-600">
                            {formatTime(conversation.updatedAt)}
                          </p>
                          {conversation.messages.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              {conversation.messages.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConversation(conversation.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t border-orange-200 bg-orange-100/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-700">Total conversations</span>
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                {conversations.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarLayout>
      <SubscriptionGuard>
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <ConversationsSidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
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
            <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
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
          </div>
        </div>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}