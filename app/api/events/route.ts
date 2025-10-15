import { NextResponse } from 'next/server';
import { ensureAppUserId } from '@/lib/db';
import { prisma } from '@/lib/db/prisma';
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
          await prisma.twitterAccount.upsert({
            where: { twitterUserId: d.id },
            update: {
              handle: d.username,
              name: d.name || null,
              description: d.description || null,
              profileImageUrl: d.profile_image_url || null,
              followersCount: d.public_metrics?.followers_count ?? 0,
              followingCount: d.public_metrics?.following_count ?? 0,
              tweetCount: d.public_metrics?.tweet_count ?? 0,
              lastSyncedAt: new Date(),
              backfillStatus: 'pending',
            },
            create: {
              userId: appUserId,
              twitterUserId: d.id,
              handle: d.username,
              name: d.name || null,
              description: d.description || null,
              profileImageUrl: d.profile_image_url || null,
              followersCount: d.public_metrics?.followers_count ?? 0,
              followingCount: d.public_metrics?.following_count ?? 0,
              tweetCount: d.public_metrics?.tweet_count ?? 0,
              lastSyncedAt: new Date(),
              backfillStatus: 'pending',
            },
          });
          return NextResponse.json({ ok: true, created: true, twitter: 'upserted' });
        }
      }

      return NextResponse.json({ ok: true, created: true, twitter: 'skipped_no_handle_or_token' });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ ok: true, created: true, twitter: 'skipped_error' });
    }
  } catch (e) {
    // Provide structured error details instead of JSON.stringify(Error)
    const err: any = e;
    console.error('Error in /api/events:', err);
    return NextResponse.json({
      ok: false,
      error: err
    }, { status: 500 });
  }
}


