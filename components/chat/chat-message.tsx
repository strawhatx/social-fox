"use client";

import { Avatar, AvatarFallback } from '../ui/avatar';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatMessage({ type, content, timestamp }: ChatMessageProps) {
  const isUser = type === 'user';
  
  return (
    <div className="group">
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-muted' 
            : 'bg-primary'
        }`}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm text-muted-foreground">
              {isUser ? 'You' : 'Social Fox'}
            </span>
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className={`
            max-w-none prose prose-sm
            ${isUser 
              ? 'bg-muted/50 rounded-2xl p-4' 
              : ''
            }
          `}>
            <p className="leading-relaxed whitespace-pre-wrap m-0">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}