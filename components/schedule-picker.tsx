"use client";

import { useMemo, useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { ChevronDown } from 'lucide-react';

type SchedulePickerProps = {
    scheduledAt?: Date;
    onConfirm: (date: Date) => void;
    disabled?: boolean;
};

export default function SchedulePicker({ scheduledAt, onConfirm, disabled }: SchedulePickerProps) {
    const [open, setOpen] = useState(false);
    const initial = scheduledAt ?? new Date();
    const [day, setDay] = useState<Date>(initial);
    const [hour, setHour] = useState<string>(String(initial.getHours()).padStart(2, '0'));
    const [minute, setMinute] = useState<string>(String(initial.getMinutes()).padStart(2, '0'));

    const preview = useMemo(() => {
        const withHours = setHours(day, Number(hour));
        const withMinutes = setMinutes(withHours, Number(minute));
        return withMinutes;
    }, [day, hour, minute]);

    const label = scheduledAt ? `In Queue` : `Add to Queue`;
    const labelDate = scheduledAt ? format(scheduledAt, 'MMM d, yyyy h:mm a') : undefined;

    const hours: string[] = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes: string[] = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    className={`flex-1 flex flex-col items-center py-2 text-sm ${scheduledAt ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    <div className="flex items-center gap-1">
                        <span>{label}</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                    <span className="text-xs opacity-90">{labelDate ?? format(preview, 'MMM d, yyyy h:mm a')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-[320px]">
                <div className="space-y-3">
                    <Calendar
                        mode="single"
                        selected={day}
                        onSelect={(d) => d && setDay(d)}
                        initialFocus
                    />
                    <div className="flex items-center gap-2">
                        <Select value={hour} onValueChange={setHour}>
                            <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map((h) => (
                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-xs">:</span>
                        <Select value={minute} onValueChange={setMinute}>
                            <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="ml-auto text-xs text-muted-foreground">{format(preview, 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            className="flex-1"
                            onClick={() => {
                                onConfirm(preview);
                                setOpen(false);
                            }}
                        >
                            Confirm
                        </Button>
                        <Button variant="outline" onClick={() => setOpen(false)} className="h-8 text-xs">Cancel</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}


