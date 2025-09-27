'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface UsageData {
  feature: string;
  used: number;
  limit: number;
  resetDate: string;
}

export default function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/usage');
        const data = await res.json();
        if (res.ok && data?.usage) {
          setUsage(data.usage);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fmt = (n: number | null | undefined) => (typeof n === 'number' ? n : '—');

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">Loading...</Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {usage.map((item) => (
        <Badge 
          key={item.feature} 
          variant="outline" 
          title={`${item.feature} usage - resets ${new Date(item.resetDate).toLocaleDateString()}`}
        >
          {item.feature} {fmt(item.used)}/{fmt(item.limit)}
        </Badge>
      ))}
    </div>
  );
}


