"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';

type Topic = { value: string; label: string; count: number };
type Community = { id: string; name: string };

export default function CommunityFilters({
  selectedTopic,
  setSelectedTopic,
  selectedCommunity,
  setSelectedCommunity,
  topicsCount,
}: {
  selectedTopic: string;
  setSelectedTopic: (v: string) => void;
  selectedCommunity: string;
  setSelectedCommunity: (v: string) => void;
  topicsCount?: number;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newCommunity, setNewCommunity] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const t = await fetch('/api/topics/popular').then((r) => r.ok ? r.json() : null);
        if (t?.topics) setTopics(t.topics);
      } catch {}
      try {
        const c = await fetch('/api/communities').then((r) => r.ok ? r.json() : null);
        if (c?.communities) setCommunities(c.communities);
      } catch {}
    })();
  }, []);

  const addCommunity = async () => {
    const name = newCommunity.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/communities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      if (res.ok) {
        setCommunities((prev) => [...prev, { id: crypto.randomUUID(), name }]);
        setNewCommunity('');
      }
    } catch {}
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Filters:</span>
          </div>

          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
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

          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
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
            <Input placeholder="Add community" value={newCommunity} onChange={(e) => setNewCommunity(e.target.value)} className="h-9 w-40" />
            <Button size="sm" variant="outline" onClick={addCommunity}>Add</Button>
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


