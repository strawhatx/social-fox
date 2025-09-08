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

      // Pull recent tweets from our DB to better reflect style
      const dbTweetsRes = await db.query<{ text: string }>(
        `SELECT text FROM public.tweets WHERE twitter_account_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [acct.id]
      );
      const samples: string[] = (dbTweetsRes.rows || [])
        .map((r) => String(r.text || ''))
        .filter((t) => t && t.length > 0)
        .slice(0, 50);

      const effectiveProfile = {
        handle: acct.handle,
        name: acct.name,
        description: acct.description,
        followers_count: acct.followers_count,
        following_count: acct.following_count,
        tweet_count: acct.tweet_count,
        samples,
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

    // Weekly aggregation (last 7 days window)
    await db.query(`
      INSERT INTO public.content_performance (twitter_account_id, period, start_date, end_date, avg_engagement_rate, tweets_posted, top_tweet_id)
      SELECT ta.id,
             'weekly'::text,
             (CURRENT_DATE - INTERVAL '7 days')::date AS start_date,
             CURRENT_DATE AS end_date,
             NULLIF(AVG((COALESCE(t.like_count,0) + COALESCE(t.retweet_count,0) + COALESCE(t.reply_count,0))::numeric / NULLIF(COALESCE(t.impression_count,0),0)), NULL) AS avg_engagement_rate,
             COUNT(t.id) AS tweets_posted,
             (
               SELECT id FROM public.tweets tt
               WHERE tt.twitter_account_id = ta.id
                 AND tt.created_at >= CURRENT_DATE - INTERVAL '7 days'
               ORDER BY (COALESCE(tt.like_count,0) + COALESCE(tt.retweet_count,0) + COALESCE(tt.reply_count,0)) DESC
               LIMIT 1
             ) AS top_tweet_id
      FROM public.twitter_accounts ta
      LEFT JOIN public.tweets t ON t.twitter_account_id = ta.id AND t.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY ta.id
    `);

    // Monthly aggregation (last 30 days window)
    await db.query(`
      INSERT INTO public.content_performance (twitter_account_id, period, start_date, end_date, avg_engagement_rate, tweets_posted, top_tweet_id)
      SELECT ta.id,
             'monthly'::text,
             (CURRENT_DATE - INTERVAL '30 days')::date AS start_date,
             CURRENT_DATE AS end_date,
             NULLIF(AVG((COALESCE(t.like_count,0) + COALESCE(t.retweet_count,0) + COALESCE(t.reply_count,0))::numeric / NULLIF(COALESCE(t.impression_count,0),0)), NULL) AS avg_engagement_rate,
             COUNT(t.id) AS tweets_posted,
             (
               SELECT id FROM public.tweets tt
               WHERE tt.twitter_account_id = ta.id
                 AND tt.created_at >= CURRENT_DATE - INTERVAL '30 days'
               ORDER BY (COALESCE(tt.like_count,0) + COALESCE(tt.retweet_count,0) + COALESCE(tt.reply_count,0)) DESC
               LIMIT 1
             ) AS top_tweet_id
      FROM public.twitter_accounts ta
      LEFT JOIN public.tweets t ON t.twitter_account_id = ta.id AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY ta.id
    `);

    // Account analysis (heuristics based on last 7/30 days)
    await db.query(`
      INSERT INTO public.account_analysis (twitter_account_id, period, best_posting_time, best_tweet_type, engagement_summary)
      SELECT ta.id,
             'last_7_days'::text,
             NULL::text AS best_posting_time,
             NULL::text AS best_tweet_type,
             jsonb_build_object(
               'avg_likes', AVG(COALESCE(t.like_count,0)),
               'avg_retweets', AVG(COALESCE(t.retweet_count,0)),
               'avg_replies', AVG(COALESCE(t.reply_count,0))
             ) AS engagement_summary
      FROM public.twitter_accounts ta
      LEFT JOIN public.tweets t ON t.twitter_account_id = ta.id AND t.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY ta.id
    `);

    await db.end();
  } catch (e) {
    await db.end();
    throw e;
  }
}


