"use client";

// MentionPicker
// - Client-side popover that fetches mention suggestions (Twitter via API, with LLM fallback)
// - Applies in-page caching keyed by content to avoid repeated API calls while focused
// - onInsert: parent injects the @handle into the editor with length checks

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { AtSign } from "lucide-react";

type MentionPickerProps = {
  content: string;
  onInsert: (handle: string) => void;
  onAddManual: () => void;
};

export function MentionPicker({ content, onInsert, onAddManual }: MentionPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const cacheRef = useRef<Record<string, string[]>>({});

  const fetchMentions = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setSuggestions([]);
    
    const cacheKey = (content || "").trim();
   
    try {
      if (cacheKey && cacheRef.current[cacheKey]) {
        setSuggestions(cacheRef.current[cacheKey]);
        return;
      }
      
      const resp = await fetch(`/api/mentions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, limit: 10 }),
      });
      
      if (!resp.ok) throw new Error('Failed to fetch mentions');
      
      const data = await resp.json();
      const result = Array.isArray(data.handles) ? data.handles : [];
      
      setSuggestions(result);
      
      if (cacheKey) cacheRef.current[cacheKey] = result;
      if (!result.length) setError("No mention suggestions found.");
    } catch (e) {
      setError("Unable to fetch mentions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" onClick={fetchMentions} className="flex items-center gap-1">
          <AtSign className="h-3 w-3" />
          Mentions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Suggested mentions</div>
          {loading && <div className="text-sm">Loading…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((h) => (
                <Button
                  key={h}
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => {
                    onInsert(h);
                    setOpen(false);
                  }}
                >
                  {h}
                </Button>
              ))}
              {!suggestions.length && (
                <div className="text-sm text-muted-foreground">No suggestions</div>
              )}
            </div>
          )}
          <Separator />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onAddManual}>Add manual @</Button>
            <Button size="sm" className="h-7 text-xs ml-auto" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MentionPicker;
