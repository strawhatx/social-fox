"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import data from '@emoji-mart/data';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Smile } from 'lucide-react';

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

type EmojiPickerProps = {
  onInsert: (emoji: string) => void;
};

export default function EmojiPicker({ onInsert }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-7 w-7 p-0">
          <Smile className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px] bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200" sideOffset={15} 
      alignOffset={100}
      align="end">
        <Picker
          data={data}
          onEmojiSelect={(e: any) => {
            const native = e?.native as string | undefined;
            if (native) onInsert(native);
            setOpen(false);
          }}
          theme="light"
          previewPosition="none"
          searchPosition="top"
        />
      </PopoverContent>
    </Popover>
  );
}


