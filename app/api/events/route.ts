import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// This is used to trigger a sync of a user's twitter account
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { type, userId } = payload ?? {};

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    }

    // Look up existing cache info
    const rows = await sql`SELECT last_profile_fetch_at, last_posts_fetch_at FROM public.twitter_profile_cache WHERE user_id = ${userId} LIMIT 1`;
    const cache = (rows as Array<{ last_profile_fetch_at: string | null; last_posts_fetch_at: string | null }>)[0];
    const nowMs = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const isStale = (ts: string | null | undefined) => {
      if (!ts) return true; // treat missing timestamps as stale
      const t = new Date(ts).getTime();
      if (Number.isNaN(t)) return true;
      return nowMs - t >= DAY_MS;
    };

    // Determine which actions to enqueue
    let actions: ('profile' | 'posts')[] = [];
    if (!cache) {
      actions = ['profile', 'posts'];
    } else {
      const profileStale = isStale(cache.last_profile_fetch_at);
      const postsStale = isStale(cache.last_posts_fetch_at);
      if (profileStale) actions.push('profile');
      if (postsStale) actions.push('posts');
    }

    if (actions.length === 0) {
      console.log('Auth event received; no job enqueued (cache fresh):', { type, userId });
      return NextResponse.json({ ok: true, created: false, actions: [] });
    }

    // Manual conflict check: if a pending job exists for same user/action, return 409
    const conflicts = await Promise.all(
      actions.map((a) => sql`SELECT 1 FROM public.twitter_account_sync_job WHERE user_id = ${userId} AND action = ${a} AND status = 'pending' LIMIT 1`)
    );

    // If a conflict is found, return 200 but don't enqueue the job
    const hasConflict = conflicts.some((r) => Array.isArray(r) ? r.length > 0 : false);
    if (hasConflict) {
      return NextResponse.json({ ok: true, created: false, actions }, { status: 200 });
    }

    // Insert jobs with required action
    await Promise.all(actions.map((a) => sql`INSERT INTO public.twitter_account_sync_job (user_id, action) VALUES (${userId}, ${a})`));

    console.log('Auth event received and jobs queued:', { type, userId, actions });
    return NextResponse.json({ ok: true, created: true, actions });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}


