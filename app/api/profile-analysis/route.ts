import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql, resolveUserUuid } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    
    const rows = await sql`SELECT handle, name, description, followers_count, following_count, tweet_count FROM public.twitter_accounts WHERE user_id = ${appUserId} LIMIT 1`;
    const profile = (rows as any[])?.[0] || null;
    return NextResponse.json({ ok: true, profile });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


