'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialContent: string;
  initialScheduledAt: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'archived';
  onSave: (id: string, updates: { content?: string; scheduled_at?: string | null }) => Promise<void> | void;
};

export default function EditPost({ open, onOpenChange, postId, initialContent, initialScheduledAt, status, onSave }: Props) {
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState<Date | undefined>(initialScheduledAt ? new Date(initialScheduledAt) : undefined);
  const [time, setTime] = useState<string>(initialScheduledAt ? format(new Date(initialScheduledAt), 'HH:mm') : '08:30:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setDate(initialScheduledAt ? new Date(initialScheduledAt) : undefined);
      setTime(initialScheduledAt ? format(new Date(initialScheduledAt), 'HH:mm') : '08:30:00');
    }
  }, [open, initialContent, initialScheduledAt]);

  const isPosted = status === 'posted';
  const combinedDate = useMemo(() => {
    if (!date) return undefined;
    // Build a local date with selected time (defaults to 09:00 if empty)
    const [hh, mm] = (time || '09:00').split(':');
    const d = new Date(date);
    d.setHours(Number(hh || 0), Number(mm || 0), 0, 0);
    return d;
  }, [date, time]);
  const isPastTime = combinedDate ? combinedDate.getTime() < Date.now() : false;
  const canEdit = !isPosted && !(combinedDate && isPastTime);

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const scheduled_at = combinedDate ? new Date(combinedDate).toISOString() : null;
      await onSave(postId, { content: content.trim() || undefined, scheduled_at });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Content</label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={!canEdit} className="mt-1" maxLength={280} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Scheduled for</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPosted}
                    className="justify-start w-[220px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarPicker
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={isPosted}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  id="time-picker"
                  step="1"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={isPosted}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </div>
          </div>
          {!canEdit && (
            <p className="text-xs text-muted-foreground">Cannot edit: already posted or scheduled time is in the past.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canEdit || saving}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

