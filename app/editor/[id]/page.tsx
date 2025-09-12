"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { DraftCard } from '../../../components/chat/draft-card';
import { Message, generateDrafts, Conversation } from '@/lib/copilot';
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
    ArrowLeft,
    Sparkles,
    User
} from "lucide-react";
import TweetEditor from '@/components/editor/tweet-editor';
import SubscriptionGuard from '@/components/subscription/subscription-guard';
import SidebarLayout from '@/components/sidebar-layout';

const CONTENT_CATEGORIES = [
    { id: 'engagement', label: 'Engagement', icon: MessageSquare, active: true },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'educational', label: 'Educational', icon: BookOpen },
    { id: 'launches', label: 'Launches', icon: Rocket },
];

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationId = params.id as string;

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('engagement');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Load conversation and messages
    useEffect(() => {
        if (conversationId) {
            loadConversation();
        }
    }, [conversationId]);

    // Handle generate flag for new conversations
    useEffect(() => {
        const shouldGenerate = searchParams.get('generate');
        if (shouldGenerate === 'true' && conversation && messages.length === 1) {
            // Only generate if we have exactly 1 message (the user's first message)
            generateAssistantResponse();
            // Remove the generate flag from URL
            router.replace(`/editor/${conversationId}`);
        }
    }, [conversation, messages, searchParams, conversationId, router]);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages]);

    const loadConversation = async () => {
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                setConversation(data);

                // Convert database messages to the expected format
                const formattedMessages: Message[] = (data.messages || []).map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.createdAt),
                    drafts: msg.metadata?.drafts || undefined
                }));

                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };


    const generateAssistantResponse = async () => {
        if (!conversation || messages.length === 0) return;

        setIsGenerating(true);

        try {
            // Get the user's first message content
            const userMessage = messages.find(msg => msg.role === 'user');
            if (!userMessage) return;

            // Generate AI response
            const drafts = await generateDrafts(userMessage.content, 'motivational');

            const assistantMessage: Message = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: `I've created ${drafts.length} post variations for you with a motivational tone. You can ask me to refine them, create new variations, or edit specific aspects.`,
                timestamp: new Date(),
                drafts
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Create assistant message in database
            const assistantMessageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'assistant',
                    content: assistantMessage.content,
                    metadata: { drafts }
                })
            });

            if (!assistantMessageResponse.ok) {
                throw new Error('Failed to create assistant message');
            }

        } catch (error) {
            console.error('Error generating assistant response:', error);
            const errorMessage: Message = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: "Sorry, I had trouble generating those posts. Please try again!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSend = async () => {
        if (!prompt.trim() || isGenerating) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: prompt.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsGenerating(true);
        setPrompt('');

        try {
            // Create user message in database
            const userMessageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'user',
                    content: prompt.trim()
                })
            });

            if (!userMessageResponse.ok) {
                throw new Error('Failed to create user message');
            }

            const userMessageData = await userMessageResponse.json();
            const dbUserMessage: Message = {
                id: userMessageData.id,
                role: userMessageData.role,
                content: userMessageData.content,
                timestamp: new Date(userMessageData.createdAt)
            };

            setMessages(prev => [...prev, dbUserMessage]);

            // Generate AI response
            const drafts = await generateDrafts(prompt.trim(), 'motivational');

            const assistantMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: `I've created ${drafts.length} post variations for you with a motivational tone. You can ask me to refine them, create new variations, or edit specific aspects.`,
                timestamp: new Date(),
                drafts
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Create assistant message in database
            const assistantMessageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'assistant',
                    content: assistantMessage.content,
                    metadata: { drafts }
                })
            });

            if (!assistantMessageResponse.ok) {
                throw new Error('Failed to create assistant message');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: "Sorry, I had trouble generating those posts. Please try again!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };



    const handleSendToEditor = (draft: any) => {
        // TODO: Implement send to editor functionality
        console.log('Send to editor:', draft);
    };

    const handleEditInChat = (draft: any) => {
        setPrompt(`Edit this post: "${draft.text}"`);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <SidebarLayout>
            <SubscriptionGuard>
                <div className="flex h-full bg-gradient-to-br from-blue-50 to-orange-50 min-h-screen">
                    {/* Left Panel - Content Sources with Tabs */}
                    <div className="w-1/2 md:w-3/5 xl:w-3/4 border-r border-border p-4">

                        {/* Header */}
                        <header className="border-b bg-background px-6 py-4 flex-shrink-0">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push('/editor')}
                                            className="h-8 w-8"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-lg text-foreground">{conversation.title}</h1>
                                            <p className="text-sm text-muted-foreground">Social Fox Social Fox</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {CONTENT_CATEGORIES.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant={selectedCategory === category.id ? "default" : "secondary"}
                                            className="flex items-center gap-1 px-3 py-1 cursor-pointer whitespace-nowrap"
                                            onClick={() => setSelectedCategory(category.id)}
                                        >
                                            <category.icon className="h-3 w-3" />
                                            {category.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {/* Chat Messages */}
                        <ScrollArea className="flex-1" ref={scrollAreaRef}>
                            <div className="max-w-4xl mx-auto px-6 py-6">
                                <div className="space-y-8">
                                    {messages.map((message) => (
                                        <div key={message.id} className="space-y-4">
                                            {/* Message */}
                                            <div className="flex items-start gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                                    ? 'bg-muted'
                                                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                    }`}>
                                                    {message.role === 'user' ? (
                                                        <User className="h-4 w-4" />
                                                    ) : (
                                                        <Sparkles className="h-4 w-4 text-white" />
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            {message.role === 'user' ? 'You' : 'Social Fox'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    <div className={`${message.role === 'user'
                                                        ? 'bg-muted/50 rounded-2xl p-4'
                                                        : ''
                                                        }`}>
                                                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Drafts */}
                                            {message.drafts && (
                                                <div className="ml-12 space-y-3">
                                                    {message.drafts.map((draft) => (
                                                        <DraftCard
                                                            key={draft.id}
                                                            draft={draft}
                                                            onEditInChat={handleEditInChat}
                                                            onSendToEditor={handleSendToEditor}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Loading State */}
                                    {isGenerating && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Social Fox</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span className="text-sm text-muted-foreground">Generating your posts...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="border-t bg-background p-6 flex-shrink-0">
                            <div className="max-w-4xl mx-auto">
                                <div className="relative">
                                    <Textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask me to refine the posts, create new variations, or make specific edits..."
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
                                    Continue the conversation to refine your posts. Social Fox can make mistakes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Editor */}
                    <div className="w-1/2 md:w-2/5 xl:w-1/4 max-w-full p-4 text-sm">
                        <TweetEditor />
                    </div>
                </div>  
            </SubscriptionGuard>
        </SidebarLayout>

    );
}
