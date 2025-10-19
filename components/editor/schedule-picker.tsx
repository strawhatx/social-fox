"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Clock, Plus } from 'lucide-react';
import { Dialog, DialogFooter, DialogContent, DialogDescription,  DialogTitle, DialogHeader } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

type SchedulePickerProps = {
    scheduledAt?: Date;
    onConfirm: (date: Date) => void;
    disabled?: boolean;
};

export default function SchedulePicker({ scheduledAt, onConfirm, disabled }: SchedulePickerProps) {
  const [showAddPostDialog, setShowAddPostDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(scheduledAt ?? null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  
  const commonTimes = [
    { label: 'Morning', time: '09:00' },
    { label: 'Noon', time: '12:00' },
    { label: 'Afternoon', time: '15:00' },
    { label: 'Evening', time: '18:00' },
  ];

  const handleOpen = () => {
    setSelectedDate(scheduledAt ?? new Date());
    setShowAddPostDialog(true);
  };

  const handleConfirm = () => {
    const base = selectedDate ?? scheduledAt ?? new Date();
    const [hourStr, minuteStr] = selectedTime.split(":");
    const hour = parseInt(hourStr || "0", 10);
    const minute = parseInt(minuteStr || "0", 10);
    const dt = new Date(base);
    dt.setHours(hour, minute, 0, 0);
    setShowAddPostDialog(false);
    onConfirm(dt);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className="w-full text-xs justify-start px-2 h-6 text-orange-600 border-orange-200 border-dashed hover:bg-orange-50"
        onClick={handleOpen}
      >
        
       + Add Post
      </Button>

      <Dialog open={showAddPostDialog} onOpenChange={setShowAddPostDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Schedule New Post
          </DialogTitle>
          <DialogDescription>
            Select a date and time to schedule your new social media post.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">
              Time
            </Label>
            <div className="flex gap-2 mb-2">
              {commonTimes.map((timeOption) => (
                <Button
                  key={timeOption.time}
                  type="button"
                  variant={selectedTime === timeOption.time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(timeOption.time)}
                  className={selectedTime === timeOption.time ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
                >
                  {timeOption.label}
                </Button>
              ))}
            </div>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full"
            />
          </div>
          {selectedDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
              <p className="text-sm text-orange-900">
                <span className="font-medium">Scheduled for:</span>
                <br />
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedTime}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddPostDialog(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleConfirm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}


