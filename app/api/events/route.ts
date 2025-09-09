import { NextResponse } from 'next/server';
import { sql, ensureAppUserId } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server';
import { getUserTwitterBearerToken, fetchTwitterUserByUsername } from '@/lib/twitter';

// This is used to trigger a sync of a user's twitter account
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { type, userId } = payload ?? {};

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
    }

    // Only act on registration/login events
    const shouldEnsure = ['signup', 'signin'].includes(String(type || '').toLowerCase());
    if (!shouldEnsure) {
      console.log('skipped', type);
      return NextResponse.json({ ok: true, created: false, skipped: true });
    }

    // 1) Ensure app user row exists (idempotent)
    const appUserId = await ensureAppUserId(String(userId));

    // 2) Try to create twitter_accounts row if missing
    try {
      const clientAny = (typeof (clerkClient as any) === 'function')
        ? await (clerkClient as any)()
        : (clerkClient as any);
      const user = await clientAny.users.getUser(String(userId));
      const externalAccounts: any[] = (user as any).externalAccounts || (user as any).external_accounts || [];
      const tw = externalAccounts.find((acc: any) => ['oauth_twitter', 'oauth_x', 'twitter', 'x'].includes(acc.provider));
      const handle = tw?.username || tw?.external_username || null;

      const bearer = await getUserTwitterBearerToken(String(userId));

      if (bearer && handle) {
        const d = await fetchTwitterUserByUsername(handle, bearer);
        if (d?.id && d?.username) {
          await sql`
            INSERT INTO public.twitter_accounts (
              user_id, twitter_user_id, handle, name, description, profile_image_url,
              followers_count, following_count, tweet_count, last_synced_at,
              backfill_status
            ) VALUES (
              ${appUserId}, ${d.id}, ${d.username}, ${d.name || null}, ${d.description || null}, ${d.profile_image_url || null},
              ${d.public_metrics?.followers_count ?? 0}, ${d.public_metrics?.following_count ?? 0}, ${d.public_metrics?.tweet_count ?? 0}, 
              now(), 'pending'
            )
            ON CONFLICT (twitter_user_id)
            DO UPDATE SET
              handle = EXCLUDED.handle,
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              profile_image_url = EXCLUDED.profile_image_url,
              followers_count = EXCLUDED.followers_count,
              following_count = EXCLUDED.following_count,
              tweet_count = EXCLUDED.tweet_count,
              last_synced_at = now(),
              backfill_status = EXCLUDED.backfill_status`;

          return NextResponse.json({ ok: true, created: true, twitter: 'upserted' });
        }
      }

      return NextResponse.json({ ok: true, created: true, twitter: 'skipped_no_handle_or_token' });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ ok: true, created: true, twitter: 'skipped_error' });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
}


