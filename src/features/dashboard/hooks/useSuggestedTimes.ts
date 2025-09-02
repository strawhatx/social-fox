import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export type SuggestedTime = {
  time: string; // e.g. "9:00 AM"
  day: string;  // e.g. "Today", "Tomorrow"
  optimal: boolean;
  dateTimeIso?: string; // optional: future wiring to precise ISO timestamp
};

export function useSuggestedTimes(workspaceId?: string | null) {
  const [times, setTimes] = useState<SuggestedTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Heuristic schedule (simple, non-personalized):
    // - Weekdays: early morning (6–8am), lunch (12–1pm), evening (5–7pm)
    // - Weekends: lower engagement -> suggest fewer, non-optimal slots
    setLoading(true);

    const now = new Date();
    const today = now;
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    const makeAt = (base: Date, hour: number, minute: number) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0);
      return d;
    };
    const makeItem = (d: Date, label: string, optimal: boolean): SuggestedTime => ({
      time: format(d, 'h:mm a'),
      day: label,
      optimal,
      dateTimeIso: d.toISOString(),
    });

    const buildFor = (base: Date, label: string): SuggestedTime[] => {
      if (!isWeekend(base)) {
        // Weekday windows (representative times)
        const slots = [
          { h: 7, m: 30, optimal: true },   // early morning
          { h: 12, m: 15, optimal: false }, // lunch
          { h: 18, m: 0, optimal: true },   // evening
        ];
        return slots.map(s => makeItem(makeAt(base, s.h, s.m), label, s.optimal));
      }
      // Weekend: fewer, non-optimal by default
      const weekendSlots = [
        { h: 10, m: 0, optimal: false },
        { h: 18, m: 0, optimal: false },
      ];
      return weekendSlots.map(s => makeItem(makeAt(base, s.h, s.m), label, s.optimal));
    };

    // Build and filter past times for today
    const todayItems = buildFor(today, 'Today').filter(i => {
      const dt = i.dateTimeIso ? new Date(i.dateTimeIso) : null;
      return !dt || dt > now;
    });
    const tomorrowItems = buildFor(tomorrow, 'Tomorrow');

    const result = [...todayItems, ...tomorrowItems].slice(0, 6);
    setTimes(result);
    setLoading(false);
  }, [workspaceId]);

  return { times, loading };
}


