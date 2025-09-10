"use client";

import { Button } from '../ui/button';
import { TONE_PRESETS, ToneType } from '@/lib/copilot';

interface ToneSelectorProps {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
}

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Tone:</span>
      <div className="flex gap-1">
        {TONE_PRESETS.map(tone => (
          <Button
            key={tone.id}
            variant={selectedTone === tone.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onToneChange(tone.id)}
            className="h-7 px-2 text-xs flex items-center gap-1"
          >
            <span>{tone.emoji}</span>
            {tone.label}
          </Button>
        ))}
      </div>
    </div>
  );
}