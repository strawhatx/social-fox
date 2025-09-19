"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { DraftCard } from "../../../components/chat/draft-card";
import { Draft } from "@/lib/copilot";
import { Loader2, Send, Sparkles, User, ArrowLeft } from "lucide-react";
import TweetEditor from "@/components/editor/tweet-editor";
import SubscriptionGuard from "@/components/subscription/subscription-guard";
import SidebarLayout from "@/components/sidebar-layout";
import { ChatMessage, useChat } from "@/hooks/use-chat";
import { useConversationContext } from "@/hooks/use-conversation-context";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { initialMessage, clearInitialMessage } = useConversationContext();

  const conversationId = params.id as string;

  const { messages, sendMessage, retryMessage, connected, canSend } = useChat(conversationId, initialMessage || undefined);

  const [prompt, setPrompt] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Clear initial message after it's been used
  useEffect(() => {
    if (initialMessage) {
      clearInitialMessage();
    }
  }, [initialMessage, clearInitialMessage]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      if (scrollEl) {
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!prompt.trim() || !canSend) return;
    sendMessage(prompt.trim());
    setPrompt("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarLayout>
      <SubscriptionGuard>
        <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-orange-50 overflow-hidden">
          {/* Left Panel - Chat */}
          <div className="w-2/3 border-r border-border flex flex-col">
            {/* Header */}
            <header className="border-b bg-background px-6 py-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/editor")}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-300 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-md text-foreground">
                  Conversation {conversationId}
                </h1>
                <span className={`ml-4 text-sm ${connected ? "text-green-600" : "text-yellow-600"}`}>
                  {connected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
                {messages.map((message: ChatMessage) => (
                  <div key={message.id || Math.random()} className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-muted"
                            : "bg-gradient-to-br from-purple-500 to-pink-500"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-white" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.role === "user" ? "You" : "Social Fox"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp
                              ? new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>

                        <div
                          className={`${
                            message.role === "user"
                              ? "bg-muted/50 rounded-2xl p-4"
                              : message.status === "pending"
                              ? "bg-muted/20 rounded-2xl p-4 italic text-gray-400"
                              : message.status === "error"
                              ? "bg-red-100 rounded-2xl p-4"
                              : ""
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">
                            {message.status === "pending" ? "Generating..." : message.content}
                          </p>

                          {message.status === "error" && message.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryMessage(message)}
                              className="mt-2"
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {message?.drafts && (
                      <div className="ml-12 space-y-3">
                        {message?.drafts.map((draft: Draft) => (
                          <DraftCard
                            key={draft.id}
                            draft={draft}
                            onEditInChat={() =>
                              setPrompt(`Edit this post: "${draft.text}"`)
                            }
                            onSendToEditor={() => console.log("Send to editor", draft)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 flex-shrink-0">
              <div className="max-w-4xl mx-auto relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={!canSend}
                  className="min-h-[52px] pr-12 resize-none rounded-2xl border-border bg-orange-50 focus:bg-orange-50 focus:outline-orange-200"
                />
                <Button
                  onClick={handleSend}
                  disabled={!prompt.trim() || !canSend}
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/3 max-w-full p-4 text-sm overflow-hidden">
            <TweetEditor />
          </div>
        </div>
      </SubscriptionGuard>
    </SidebarLayout>
  );
}
