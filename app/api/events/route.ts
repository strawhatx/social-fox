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

    // Helper: enqueue platform jobs (profile/posts) in a single table
    const enqueuePlatformJobs = async (): Promise<('profile' | 'posts')[]> => {
      const doProfile = !cache || isStale(cache.last_profile_fetch_at);
      const doPosts = !cache || isStale(cache.last_posts_fetch_at);
      const created: ('profile' | 'posts')[] = [];
      if (doProfile) {
        const p = await sql`SELECT 1 FROM public.twitter_account_sync_job WHERE user_id = ${userId} AND action = 'profile' AND status = 'pending' LIMIT 1`;
        if (!(Array.isArray(p) && p.length)) {
          await sql`INSERT INTO public.twitter_account_sync_job (user_id, action) VALUES (${userId}, 'profile')`;
          created.push('profile');
        }
      }
      if (doPosts) {
        const q = await sql`SELECT 1 FROM public.twitter_account_sync_job WHERE user_id = ${userId} AND action = 'posts' AND status = 'pending' LIMIT 1`;
        if (!(Array.isArray(q) && q.length)) {
          await sql`INSERT INTO public.twitter_account_sync_job (user_id, action) VALUES (${userId}, 'posts')`;
          created.push('posts');
        }
      }
      return created;
    };

    // Helper: enqueue tweets template generation job in its own table
    const enqueueTemplateJob = async (): Promise<boolean> => {
      const r = await sql`SELECT 1 FROM public.tweets_sync_job WHERE user_id = ${userId} AND status = 'pending' LIMIT 1`;
      if (Array.isArray(r) && r.length) return false;
      await sql`INSERT INTO public.tweets_sync_job (user_id) VALUES (${userId})`;
      return true;
    };

    const actionsCreated = await enqueuePlatformJobs();
    const templateCreated = await enqueueTemplateJob();

    return NextResponse.json({ ok: true, created: actionsCreated.length > 0 || templateCreated, actions: actionsCreated, templateCreated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}


