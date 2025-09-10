"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { RotateCcw, Edit, Send, Copy, Check } from 'lucide-react';
import { Draft } from '@/lib/copilot';

interface DraftCardProps {
  draft: Draft;
  onEditInChat: (draft: Draft) => void;
  onSendToEditor: (draft: Draft) => void;
}

export function DraftCard({ draft, onEditInChat, onSendToEditor }: DraftCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'spicy': return 'bg-red-100 text-red-800 border-red-200';
      case 'motivational': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'educational': return 'bg-green-100 text-green-800 border-green-200';
      case 'humorous': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {draft.text}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 opacity-60 hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {draft.tone}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {draft.length} chars
              </span>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditInChat(draft)}
                className="h-8 px-3 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              
              <Button
                size="sm"
                onClick={() => onSendToEditor(draft)}
                className="h-8 px-3 text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                Use
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}