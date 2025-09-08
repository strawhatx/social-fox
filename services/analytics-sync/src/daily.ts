import { getDb } from './config/db';
import { getUserTwitterFromClerk } from './config/clerk';
import { fetchTwitterProfileByUserId, fetchTwitterProfileByHandle, fetchTwitterPostsByUserId } from '../twitter-account-sync/services/twitter';

type TwitterAccountRow = {
  id: string;
  user_id: string;
  twitter_user_id: string | null;
  handle: string | null;
};

export async function runDailyAnalytics(): Promise<void> {
  const db = getDb();
  try {
    const res = await db.query<TwitterAccountRow>(
      `SELECT id, user_id, twitter_user_id, handle FROM public.twitter_accounts`
    );

    for (const acct of res.rows) {
      try {
        const { bearer } = await getUserTwitterFromClerk(acct.user_id);
        if (!bearer) continue;

        // 1) Refresh account profile metrics
        let profile: any | null = null;
        if (acct.twitter_user_id) {
          profile = await fetchTwitterProfileByUserId(acct.twitter_user_id, bearer);
        } else if (acct.handle) {
          profile = await fetchTwitterProfileByHandle(acct.handle, bearer);
        }
        const d = profile?.data;
        if (d) {
          await db.query(
            `UPDATE public.twitter_accounts
             SET twitter_user_id = COALESCE($2, twitter_user_id),
                 handle = COALESCE($3, handle),
                 name = $4,
                 description = $5,
                 profile_image_url = $6,
                 followers_count = $7,
                 following_count = $8,
                 tweet_count = $9,
                 last_profile_synced_at = NOW(),
                 updated_at = NOW()
             WHERE id = $1`,
            [
              acct.id,
              d.id || null,
              d.username || null,
              d.name || null,
              d.description || null,
              d.profile_image_url || null,
              d.public_metrics?.followers_count ?? null,
              d.public_metrics?.following_count ?? null,
              d.public_metrics?.tweet_count ?? null,
            ]
          );

          // 2) Audience metrics snapshot (once per day; guard duplicate)
          await db.query(
            `INSERT INTO public.audience_metrics (twitter_account_id, date, followers_count, following_count, new_followers)
             SELECT $1::uuid, CURRENT_DATE, $2, $3,
                    $2 - COALESCE((SELECT followers_count FROM public.audience_metrics WHERE twitter_account_id = $1 AND date = CURRENT_DATE - INTERVAL '1 day' LIMIT 1), 0)
             WHERE NOT EXISTS (
               SELECT 1 FROM public.audience_metrics WHERE twitter_account_id = $1 AND date = CURRENT_DATE
             )`,
            [acct.id, d.public_metrics?.followers_count ?? 0, d.public_metrics?.following_count ?? 0]
          );
        }

        // 3) Tweets sync (since last known tweet)
        const last = await db.query<{ tweet_id: string | null }>(
          `SELECT tweet_id FROM public.tweets WHERE twitter_account_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [acct.id]
        );
        const sinceId = last.rows?.[0]?.tweet_id || null;
        const twitterId = (d?.id as string) || acct.twitter_user_id || null;
        let posts: any | null = null;
        if (twitterId) {
          posts = await fetchTwitterPostsByUserId(twitterId, bearer, sinceId, 20);
          const list: any[] = Array.isArray(posts?.data) ? posts!.data : [];
          for (const t of list) {
            const pm = t?.public_metrics || {};
            await db.query(
              `INSERT INTO public.tweets (twitter_account_id, tweet_id, text, created_at, like_count, retweet_count, reply_count, quote_count, impression_count)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               ON CONFLICT (tweet_id)
               DO UPDATE SET like_count = EXCLUDED.like_count, retweet_count = EXCLUDED.retweet_count, reply_count = EXCLUDED.reply_count, quote_count = EXCLUDED.quote_count, impression_count = EXCLUDED.impression_count`,
              [
                acct.id,
                t.id,
                t.text || null,
                t.created_at,
                pm.like_count ?? 0,
                pm.retweet_count ?? 0,
                pm.reply_count ?? 0,
                pm.quote_count ?? 0,
                pm.impression_count ?? 0,
              ]
            );
          }
        }

        // AI templates generation moved to periodic job (weekly cadence)
      } catch (e) {
        // continue
      }
    }
  } finally {
    await db.end();
  }
}


