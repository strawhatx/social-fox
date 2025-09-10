"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Send, Sparkles, RotateCcw } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { DraftCard } from './draft-card';
import { ToneSelector } from './tone-selector';
import { TemplateSelector } from './template-selector';
import { Draft, ToneType, Message } from '@/lib/copilot';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, tone: ToneType) => void;
  onSendToEditor: (draft: Draft) => void;
  isGenerating: boolean;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  onSendToEditor, 
  isGenerating 
}: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneType>('motivational');
  const [showTemplates, setShowTemplates] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!prompt.trim() || isGenerating) return;
    onSendMessage(prompt.trim(), selectedTone);
    setPrompt('');
  };

  const handleTemplateSelect = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setShowTemplates(false);
  };

  const handleEditInChat = (draft: Draft) => {
    setPrompt(`Edit this post: "${draft.text}"`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm your AI co-pilot for creating engaging social media posts. Tell me what you'd like to post about!
                </p>
              </div>
              
              <div className="w-full max-w-2xl">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="mb-4"
                >
                  {showTemplates ? 'Hide' : 'Show'} Quick Templates
                </Button>
                
                {showTemplates && (
                  <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map(message => (
                <div key={message.id} className="space-y-4">
                  <ChatMessage
                    type={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                  
                  {message.drafts && (
                    <div className="space-y-3 ml-12">
                      {message.drafts.map(draft => (
                        <DraftCard
                          key={draft.id}
                          draft={draft}
                          onEditInChat={handleEditInChat}
                          onSendToEditor={onSendToEditor}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Generating your posts...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-4">
            <ToneSelector
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
            />
            
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Social Fox... (Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] pr-12 resize-none border-border rounded-xl"
                disabled={isGenerating}
              />
              
              <Button
                onClick={handleSend}
                disabled={!prompt.trim() || isGenerating}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Social Fox can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}