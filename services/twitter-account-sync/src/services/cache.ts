import { getDb } from '../config/db';

export type CacheRow = {
  last_profile_fetch_at: string | null;
  last_posts_fetch_at: string | null;
  handle: string | null;
  twitter_user_id: string | null;
};

export async function getCacheForUser(userId: string): Promise<CacheRow | null> {
  const db = getDb();
  const res = await db.query(
    `SELECT last_profile_fetch_at, last_posts_fetch_at, handle, twitter_user_id
     FROM public.twitter_profile_cache
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );
  await db.end();
  return (res.rows[0] as CacheRow) || null;
}

export function isStale(ts: string | null | undefined, nowMs: number, dayMs = 24 * 60 * 60 * 1000): boolean {
  if (!ts) return true;
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return true;
  return nowMs - t >= dayMs;
}

export async function upsertProfileCache(userId: string, profilePayload: any | null): Promise<void> {
  if (!profilePayload?.data) return;
  const d = profilePayload.data;
  const db = getDb();
  const existing = await db.query('SELECT id FROM public.twitter_profile_cache WHERE user_id = $1 LIMIT 1', [userId]);
  if ((existing.rowCount ?? 0) > 0) {
    await db.query(
      `UPDATE public.twitter_profile_cache
       SET twitter_user_id = $2,
           handle = $3,
           name = $4,
           description = $5,
           profile_image_url = $6,
           followers_count = $7,
           following_count = $8,
           tweet_count = $9,
           raw_json = $10,
           last_profile_fetch_at = NOW(),
           updated_at = NOW()
       WHERE user_id = $1`,
      [
        userId,
        d.id || null,
        d.username || null,
        d.name || null,
        d.description || null,
        d.profile_image_url || null,
        d.public_metrics?.followers_count ?? null,
        d.public_metrics?.following_count ?? null,
        d.public_metrics?.tweet_count ?? null,
        profilePayload,
      ]
    );
  } else {
    await db.query(
      `INSERT INTO public.twitter_profile_cache (
         user_id, twitter_user_id, handle, name, description, profile_image_url,
         followers_count, following_count, tweet_count, raw_json, last_profile_fetch_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()
       )`,
      [
        userId,
        d.id || null,
        d.username || null,
        d.name || null,
        d.description || null,
        d.profile_image_url || null,
        d.public_metrics?.followers_count ?? null,
        d.public_metrics?.following_count ?? null,
        d.public_metrics?.tweet_count ?? null,
        profilePayload,
      ]
    );
  }
  await db.end();
}

export async function updatePostsCache(userId: string, postsPayload: any | null): Promise<void> {
  if (!postsPayload) return;
  const db = getDb();
  await db.query(
    `UPDATE public.twitter_profile_cache
     SET last_posts = $2, last_posts_fetch_at = NOW(), updated_at = NOW()
     WHERE user_id = $1`,
    [userId, postsPayload]
  );
  await db.end();
}


