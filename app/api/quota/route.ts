import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql, resolveUserUuid } from '@/lib/db';

async function readQuotaSnapshot(appUserId: string) {
  const uq = await sql`SELECT monthly_limit, used_count, reset_date FROM public.user_quotas WHERE user_id = ${appUserId} LIMIT 1`;
  return { user: (uq as any[])?.[0] || null };
}

// get quota
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });

    const quota = await readQuotaSnapshot(appUserId);
    return NextResponse.json({ ok: true, quota });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}

// increment usage by 1 (single counter)
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });

    const uq = await sql`UPDATE public.user_quotas
       SET used_count = used_count + 1
       WHERE user_id = ${appUserId}
         AND used_count < monthly_limit
         AND reset_date > now()
       RETURNING monthly_limit, used_count, reset_date`;
    const userRow = (uq as any[])?.[0] || null;
    if (!userRow) {
      return NextResponse.json({ ok: false, error: 'user_quota_exhausted' }, { status: 402 });
    }

    return NextResponse.json({ ok: true, quota: { user: userRow } });
  } catch {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


