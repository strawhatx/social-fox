"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type Topic = { value: string; label: string; count: number };
type Community = { id: string; name: string };

interface CommunityFiltersProps {
  topic: string;
  setTopic: (v: string) => void;
  community: string;
  setCommunity: (v: string) => void;
  topicsCount?: number;
}

export default function CommunityFilters({ topic, setTopic, community, setCommunity, topicsCount }: CommunityFiltersProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityUrl, setCommunityUrl] = useState('');

  useEffect(() => {
    (async () => {
      // topics
      try {
        const t = await fetch('/api/topics/popular').then((r) => r.ok ? r.json() : null);
        if (t?.topics) setTopics(t.topics);
      } catch { }

      // communities
      try {
        const c = await fetch('/api/communities').then((r) => r.ok ? r.json() : null);
        if (c?.communities) setCommunities(c.communities);
      } catch { }
    })();
  }, []);

  const addCommunity = async () => {
    const url = communityUrl.trim();
    if (!url) return;

    try {
      const res = await fetch('/api/communities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ communityUrl: url }) });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        
        if (data?.community) {
          setCommunities((prev) => [...prev, data.community]);
          setCommunityUrl('');
        }
      }
    } catch { }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Filters:</span>
          </div>

          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.value} value={topic.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{topic.label}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {topic.count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Community" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              value={communityUrl}
              onChange={(e) => setCommunityUrl(e.target.value)}
              placeholder="Community URL (e.g. https://x.com/i/communities/123456789)"
              className="text-sm"
            />

            <Button size="sm" variant="outline" onClick={addCommunity}>Add</Button>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Info className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="text-xs font-medium mb-1">Share to a community</div>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  Paste the community URL from X. On X: open your Community and copy the URL from the address bar (for example: https://x.com/i/communities/123456789).
                </p>
              </HoverCardContent>
            </HoverCard>
            </div>

          {typeof topicsCount === 'number' && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">{topicsCount} trending posts</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


