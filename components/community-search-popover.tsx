'use client';

import { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowRight } from 'lucide-react';

type Community = { id: string; name: string; platform: string };

export function CommunitySearchPopover({
  onSelect,
  children,
}: {
  onSelect: (community: Community) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cache] = useState(new Map<string, Community[]>());

  const runSearch = async (term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    if (cache.has(t)) {
      setResults(cache.get(t) || []);
      return;
    }
    try {
      setIsSearching(true);
      const res = await fetch(`/api/communities?q=${encodeURIComponent(t)}`);
      const json = await res.json();
      const list: Community[] = json?.communities || [];
      cache.set(t, list);
      setResults(list);
    } finally {
      setIsSearching(false);
    }
  };

  const emptyState = useMemo(() => query.trim().length >= 2 && !isSearching && results.length === 0, [query, isSearching, results]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-3">
          <div className="text-sm font-medium">Search communities</div>
          <div className="flex gap-2">
            <Input
              placeholder="Type to search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <Button
              variant="secondary"
              size="sm"
              className="px-3"
              onClick={() => runSearch(query)}
              disabled={query.trim().length < 2 || isSearching}
              aria-label="Search communities"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-64 overflow-auto space-y-1">
            {results.map((c) => (
              <Button
                key={c.id}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
              >
                {c.name}
              </Button>
            ))}
            {isSearching && (
              <div className="px-2 py-1 text-xs text-muted-foreground">Searching…</div>
            )}
            {emptyState && (
              <div className="px-2 py-1 text-xs text-muted-foreground">No communities found</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


