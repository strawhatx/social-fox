import { NextResponse } from 'next/server';
import { sql, resolveUserUuid } from '@/lib/db';

// This is used to trigger a sync of a user's twitter account
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { type, userId } = payload ?? {};

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    }

    // Resolve to app user UUID
    const appUserId = await resolveUserUuid(String(userId || ''));
    if (!appUserId) {
      return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    }

    // Look up existing cache info
    const rows = await sql`SELECT last_profile_fetch_at, last_posts_fetch_at FROM public.twitter_accounts WHERE user_id = ${appUserId} LIMIT 1`;
    const cache = (rows as Array<{ last_profile_fetch_at: string | null; last_posts_fetch_at: string | null }>)[0];
    const nowMs = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const isStale = (ts: string | null | undefined) => {
      if (!ts) return true; // treat missing timestamps as stale
      const t = new Date(ts).getTime();
      if (Number.isNaN(t)) return true;
      return nowMs - t >= DAY_MS;
    };

    // Helper: enqueue platform jobs (profile/posts) into unified app_jobs
    const enqueuePlatformJobs = async (): Promise<('profile' | 'posts')[]> => {
      const doProfile = !cache || isStale(cache.last_profile_fetch_at);
      const doPosts = !cache || isStale(cache.last_posts_fetch_at);
      const created: ('profile' | 'posts')[] = [];
      if (doProfile) {
        const p = await sql`SELECT 1 FROM public.app_jobs WHERE user_id = ${appUserId} AND action = 'profile' AND status = 'pending' LIMIT 1`;
        if (!(Array.isArray(p) && p.length)) {
          await sql`INSERT INTO public.app_jobs (user_id, action, status, payload) VALUES (${appUserId}, 'profile', 'pending', '{}'::jsonb)`;
          created.push('profile');
        }
      }
      if (doPosts) {
        const q = await sql`SELECT 1 FROM public.app_jobs WHERE user_id = ${appUserId} AND action = 'posts' AND status = 'pending' LIMIT 1`;
        if (!(Array.isArray(q) && q.length)) {
          await sql`INSERT INTO public.app_jobs (user_id, action, status, payload) VALUES (${appUserId}, 'posts', 'pending', '{}'::jsonb)`;
          created.push('posts');
        }
      }
      return created;
    };

    // Helper: enqueue tweets template generation job (unified app_jobs with action 'tweets')
    const enqueueTemplateJob = async (): Promise<boolean> => {
      const r = await sql`SELECT 1 FROM public.app_jobs WHERE user_id = ${appUserId} AND action = 'tweets' AND status = 'pending' LIMIT 1`;
      if (Array.isArray(r) && r.length) return false;
      await sql`INSERT INTO public.app_jobs (user_id, action, status, payload) VALUES (${appUserId}, 'tweets', 'pending', '{}'::jsonb)`;
      return true;
    };

    const actionsCreated = await enqueuePlatformJobs();
    const templateCreated = await enqueueTemplateJob();

    return NextResponse.json({ ok: true, created: actionsCreated.length > 0 || templateCreated, actions: actionsCreated, templateCreated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}


