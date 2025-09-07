'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface QuotaUser { monthly_limit: number; used_count: number; read_limit: number; reads_used: number; write_limit: number; writes_used: number; reads_borrowed: number; reset_date: string }
interface QuotaGlobal { quota_limit: number; remaining: number; read_quota_limit: number; read_remaining: number; write_quota_limit: number; write_remaining: number; global_reset: string }

export default function QuotaIndicator() {
  const [user, setUser] = useState<QuotaUser | null>(null);
  const [global, setGlobal] = useState<QuotaGlobal | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/quota');
        const data = await res.json();
        if (res.ok && data?.ok) {
          setUser(data.quota?.user ?? null);
          setGlobal(data.quota?.global ?? null);
        }
      } catch {}
    })();
  }, []);

  const fmt = (n: number | null | undefined) => (typeof n === 'number' ? n : '—');

  const totalReadsUsed = (user?.reads_used ?? 0) + (user?.reads_borrowed ?? 0);
  const totalReadLimit = (user?.read_limit ?? 0) + (global?.read_quota_limit ?? 0);
  const totalWritesUsed = user?.writes_used ?? 0; // no borrowing for writes per requirements
  const totalWriteLimit = user?.write_limit ?? 0;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" title={`Reads used/limit (includes borrowed from global)`}>
        Reads {fmt(totalReadsUsed)}/{fmt(totalReadLimit)}
      </Badge>
      <Badge variant="outline" title={`Writes used/limit`}>
        Writes {fmt(totalWritesUsed)}/{fmt(totalWriteLimit)}
      </Badge>
    </div>
  );
}


