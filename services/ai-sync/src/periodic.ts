import { getDb } from './config/db';
import { generateTweetsFromProfile } from './utils/generator';

export async function runPeriodicAnalytics(): Promise<void> {
  const db = getDb();
  try {
    // Generate AI templates for users who haven't generated in the last 7 days
    const accounts = await db.query<{ id: string; user_id: string; handle: string | null; name: string | null; description: string | null; followers_count: number | null; following_count: number | null; tweet_count: number | null }>(
      `SELECT id, user_id, handle, name, description, followers_count, following_count, tweet_count FROM public.twitter_accounts`
    );

    for (const acct of accounts.rows) {
      const recent = await db.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM public.ai_templates WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [acct.user_id]
      );
      const hasRecent = (recent.rows?.[0]?.n || 0) > 0;
      if (hasRecent) continue;

      const effectiveProfile = {
        handle: acct.handle,
        name: acct.name,
        description: acct.description,
        followers_count: acct.followers_count,
        following_count: acct.following_count,
        tweet_count: acct.tweet_count,

      } as any;

      const totalRes = await db.query<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM public.ai_templates WHERE user_id = $1`,
        [acct.user_id]
      );
      const existing = totalRes.rows?.[0]?.n || 0;
      const toGenerate = existing === 0 ? 25 : 10;
      const drafts = await generateTweetsFromProfile(effectiveProfile, toGenerate);

      for (const text of drafts) {
        await db.query(
          `INSERT INTO public.ai_templates (id, user_id, text, created_at)
           VALUES (gen_random_uuid()::text, $1, $2, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [acct.user_id, text]
        );
      }
    }

    await db.end();
  } catch (e) {
    await db.end();
    throw e;
  }
}


