
import { getDb } from '../_config/db';
import { generateTweetsFromProfile } from './services/generator';
import { JobRow } from '../_utils/jobs';

export const runTweetsSyncTask = async (job: JobRow) => {
  try {
    // Load profile for generation context
    const db = getDb();
    const profRes = await db.query(`SELECT handle, name, description, followers_count, following_count, tweet_count, last_posts FROM public.twitter_accounts WHERE user_id = $1 LIMIT 1`, [job.user_id]);
    const profile = profRes.rows?.[0] || {};

    // Count existing templates in public.tweets
    const countRes = await db.query(`SELECT COUNT(*)::int AS n FROM public.tweets WHERE user_id = $1`, [job.user_id]);
    const existing = countRes.rows?.[0]?.n || 0;
    const toGenerate = existing === 0 ? 25 : 10;

    // Generate posts via AI with Gemini fallback
    const drafts = await generateTweetsFromProfile(profile, toGenerate);

    // Insert drafts into public.tweets as templates
    let inserted = 0;
    for (const text of drafts) {
      await db.query(
        `INSERT INTO public.tweets (tweet_id, user_id, text, created_at)
         VALUES (gen_random_uuid()::text, $1, $2, NOW())
         ON CONFLICT (tweet_id) DO NOTHING`,
        [job.user_id, text]
      );
      inserted += 1;
    }
    await db.end();
  } catch (e) {
    
  }
};


