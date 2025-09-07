import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Intended to be invoked by a monthly scheduled job (e.g., cron/Serverless)
export async function POST() {
  try {
    await sql`UPDATE public.user_quotas SET used_count = 0, reads_used = 0, writes_used = 0, reset_date = date_trunc('month', now()) + interval '1 month' WHERE reset_date <= now()`;
    await sql`UPDATE public.global_quota SET remaining = quota_limit, read_remaining = read_quota_limit, write_remaining = write_quota_limit, reset_date = date_trunc('month', now()) + interval '1 month' WHERE reset_date <= now()`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


