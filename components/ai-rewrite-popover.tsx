'use client';

import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { Frown, Heart, Languages, Laugh, MessageCircle, Minus, Palette, PenTool, Star, Wand2, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const enhancementMap: Record<string, string> = {
  "improve-grammar": "✨ Enhanced with improved grammar and clarity",
  "translate": "🌍 Translated to English",
  "engaging-hook": "🎣 Added an engaging hook",
  "more-details": "📝 Expanded with more details", 
  "engaging": "💫 Made more engaging",
  "humorous": "😄 Added humor",
  "creative": "🎨 Enhanced creativity",
  "sarcastic": "😏 Added sarcastic tone",
  "inspirational": "⭐ Made more inspirational",
  "concise": "✂️ Made more concise"
};

export function AiRewritePopover({
  open,
  onOpenChange,
  selectedText,
  onApply
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  onApply: (replacement: string) => void;
}) {
  const handleAiEnhancement = async (action: string) => {
    if (!selectedText.trim()) {
      toast({ 
        title: 'No content to enhance', 
        description: 'Please add some content to enhance!' 
      });

      return;
    }

    // Call API for rewrite
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, style: action }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Rewrite failed');
      const enhanced = json?.rewritten || selectedText;
      
      onApply(enhanced);
      onOpenChange(false);
      
      toast({
        title: 'Content enhanced!',
        description: enhancementMap[action] || 'Content has been improved',
      });
    } catch (err: any) {
      toast({ title: 'Rewrite failed', description: err?.message || 'Please try again.' });
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 w-7 p-0"
      >
        <Wand2 className="h-3 w-3" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 p-0 bg-gray-900 border-gray-700" side="top">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-300 font-medium">Describe your change</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-300 h-6 w-6 p-0"
            onClick={() => onOpenChange(false)}
          >
            ✕
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={() => handleAiEnhancement('improve-grammar')}
            className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
          >
            <PenTool className="h-4 w-4" />
            <span className="text-sm">Improve grammar</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleAiEnhancement('translate')}
            className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm">Translate to English</span>
          </Button>
        </div>

        {/* Rephrase Section */}
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Rephrase with</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('engaging-hook')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">An engaging hook</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('more-details')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">More details</span>
            </Button>
          </div>
        </div>

        {/* Make it more Section */}
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Make it more</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('engaging')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm">Engaging</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('humorous')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Laugh className="h-4 w-4" />
              <span className="text-sm">Humorous</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('creative')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Palette className="h-4 w-4" />
              <span className="text-sm">Creative</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('sarcastic')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Frown className="h-4 w-4" />
              <span className="text-sm">Sarcastic</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('inspirational')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Star className="h-4 w-4" />
              <span className="text-sm">Inspirational</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('concise')}
              className="flex items-center gap-2 justify-start text-gray-300 hover:text-white hover:bg-gray-800 h-10 px-3"
            >
              <Minus className="h-4 w-4" />
              <span className="text-sm">Concise</span>
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
  );
}