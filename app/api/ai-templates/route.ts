import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql, resolveUserUuid } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const appUserId = await resolveUserUuid(userId);
    
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    const rows = await sql`SELECT tweet_id, text, created_at FROM public.ai_templates WHERE user_id = ${appUserId} ORDER BY created_at DESC LIMIT 100`;
    
    return NextResponse.json({ ok: true, tweets: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


