"use client";

// HashtagPicker
// - Client-side popover that fetches hashtag suggestions for given content
// - Applies in-page caching keyed by content to avoid repeated API calls while focused
// - onInsert: parent injects the hashtag into the editor with length checks

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Hash } from "lucide-react";

type HashtagPickerProps = {
  content: string;
  onInsert: (hashtag: string) => void;
  onAddManual: () => void;
  notify?: (args: { title: string; description?: string }) => void;
};

export function HashtagPicker({ content, onInsert, onAddManual, notify }: HashtagPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const cacheRef = useRef<Record<string, string[]>>({});

  const fetchHashtags = async () => {
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

      const resp = await fetch(`/api/hashtags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, limit: 10 }),
      });

      if (!resp.ok) throw new Error('Failed to fetch hashtags');

      const data = await resp.json();
      const result = Array.isArray(data.hashtags) ? data.hashtags : [];

      setSuggestions(result);

      if (cacheKey) cacheRef.current[cacheKey] = result;
      if (!result.length) setError("No suggestions found. Try a different topic.");
    } catch (e) {
      setError("Unable to fetch hashtags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" onClick={fetchHashtags} className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-7 w-7 p-0">
          <Hash className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200" sideOffset={15} 
      alignOffset={100}
      align="end">
        <div className="space-y-2">
          <div className="text-xs text-orange-600">Related hashtags</div>
          {loading && <div className="text-xs text-orange-500">Loading…</div>}
          {error && <div className="text-xs text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="secondary"
                  className="h-6 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200"
                  onClick={() => {
                    onInsert(tag);
                    setOpen(false);
                  }}
                >
                  {tag}
                </Button>
              ))}
              {!suggestions.length && (
                <div className="text-xs text-orange-500">No suggestions</div>
              )}
            </div>
          )}
          <Separator />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-6 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100" onClick={onAddManual}>Add manual #</Button>
            <Button size="sm" className="h-6 text-xs ml-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default HashtagPicker;


