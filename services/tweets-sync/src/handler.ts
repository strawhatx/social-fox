import { ScheduledHandler } from 'aws-lambda';
import { getPendingPostsJob, updateJobStatus, completeJob, failJob } from './services/jobs';
import { getDb } from './config/db';
import { generateTweetsFromProfile } from './services/generator';

export const processPosts: ScheduledHandler = async () => {
  let currentJobId: string | undefined;
  
  try {
    const job = await getPendingPostsJob();
    if (!job) {
      console.log('No pending posts jobs');
      return;
    }
    
    currentJobId = job.id;
    const updated = await updateJobStatus(currentJobId, 'processing', 'pending');
    if (!updated) return;

    // Load profile for generation context
    const db = getDb();
    const profRes = await db.query(`SELECT handle, name, description, followers_count, following_count, tweet_count, last_posts FROM public.twitter_profile_cache WHERE user_id = $1 LIMIT 1`, [job.user_id]);
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
    console.log(`Generated ${inserted} tweet templates for user ${job.user_id}`);

    await completeJob(currentJobId);
  } catch (e) {
    console.error('Tweets sync error:', e);
    if (currentJobId) await failJob(currentJobId, (e as Error)?.message || String(e));
  }
};


