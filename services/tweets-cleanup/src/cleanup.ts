import { ScheduledHandler } from 'aws-lambda';
import { Pool } from 'pg';
import { getDb } from './config/db';

async function deleteOldTweets(days: number = 60, db?: Pool): Promise<number> {
  const client = db || getDb();
  try {
    const res = await client.query(`DELETE FROM public.tweets WHERE created_at < NOW() - ($1 || ' days')::interval`, [String(days)]);
    return res.rowCount ?? 0;
  } finally {
    if (!db) await client.end();
  }
}

async function enforceUserCap(maxPerUser: number = 1000, db?: Pool): Promise<number> {
  const client = db || getDb();
  try {
    const res = await client.query(
      `WITH ranked AS (
         SELECT tweet_id, user_id,
                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
         FROM public.tweets
       )
       DELETE FROM public.tweets t
       USING ranked r
       WHERE t.tweet_id = r.tweet_id AND r.rn > $1`,
      [maxPerUser]
    );
    return res.rowCount ?? 0;
  } finally {
    if (!db) await client.end();
  }
}

export const dailyCleanup: ScheduledHandler = async () => {
  try {
    const db = getDb();
    const deleted = await deleteOldTweets(60, db);
    const trimmed = await enforceUserCap(1000, db);
    await db.end();
    console.log(`Cleanup complete. Deleted old: ${deleted}, Trimmed over-cap: ${trimmed}`);
  } catch (e) {
    console.error('Cleanup error:', e);
  }
};


