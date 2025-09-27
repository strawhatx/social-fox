'use client';

import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Button } from '../ui/button';
import { Edit, Frown, Heart, Languages, Laugh, MessageCircle, Minus, Palette, PenTool, Star, Wand2, Zap } from 'lucide-react';
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
  onApply
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (replacement: string) => void;
}) {
  const handleAiEnhancement = (action: string) => {

    // Get the instruction text for the selected action
    const instructionMap: Record<string, string> = {
      'improve-grammar': 'Improve the grammar and clarity of this text while keeping the same meaning and tone:',
      'translate': 'Translate this text to English while maintaining the original meaning and tone:',
      'engaging-hook': 'Rewrite this text to start with an engaging hook that grabs attention:',
      'more-details': 'Expand this text with more details and context while keeping it concise:',
      'engaging': 'Make this text more engaging and interesting to read:',
      'humorous': 'Add humor and wit to this text while keeping the original message:',
      'creative': 'Rewrite this text in a more creative and imaginative way:',
      'sarcastic': 'Rewrite this text with a sarcastic tone while keeping the original meaning:',
      'inspirational': 'Make this text more inspirational and motivational:',
      'concise': 'Make this text more concise while keeping all the important information:'
    };

    const instruction = instructionMap[action] || 'Improve this text:';

    onApply(instruction);
    onOpenChange(false);

    toast({
      title: 'Instruction added!',
      description: enhancementMap[action] || 'Instruction has been added',
    });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200"
        sideOffset={15}
        alignOffset={100}
        align="end"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-orange-700 font-medium text-sm">Describe your change</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 h-6 w-6 p-0"
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
              className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
            >
              <PenTool className="h-3 w-3" />
              <span className="text-xs">Improve grammar</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleAiEnhancement('translate')}
              className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
            >
              <Languages className="h-3 w-3" />
              <span className="text-xs">Translate to English</span>
            </Button>
          </div>

          {/* Rephrase Section */}
          <div className="space-y-2">
            <p className="text-orange-600 text-xs">Rephrase with</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('engaging-hook')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Heart className="h-3 w-3" />
                <span className="text-xs">An engaging hook</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('more-details')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="text-xs">More details</span>
              </Button>
            </div>
          </div>

          {/* Make it more Section */}
          <div className="space-y-2">
            <p className="text-orange-600 text-xs">Make it more</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('engaging')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Zap className="h-3 w-3" />
                <span className="text-xs">Engaging</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('humorous')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Laugh className="h-3 w-3" />
                <span className="text-xs">Humorous</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('creative')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Palette className="h-3 w-3" />
                <span className="text-xs">Creative</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('sarcastic')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Frown className="h-3 w-3" />
                <span className="text-xs">Sarcastic</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('inspirational')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Star className="h-3 w-3" />
                <span className="text-xs">Inspirational</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleAiEnhancement('concise')}
                className="flex items-center gap-2 justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-8 px-3"
              >
                <Minus className="h-3 w-3" />
                <span className="text-xs">Concise</span>
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}