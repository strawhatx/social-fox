import { sql } from '@/lib/db';
import { fetchTwitterUserByUsername, fetchUserTweetsById, getUserTwitterBearerToken } from '@/lib/twitter';

export type Plan = 'free' | 'basic' | 'pro';

export interface UserQuotaRow {
    user_id: string;
    monthly_limit: number;
    used_count: number;
    reset_date: string;
}

export interface GlobalQuotaRow {
    id: number;
    quota_limit: number;
    remaining: number;
    reset_date: string;
}

export interface UsageSnapshot {
    user_used: number;
    user_limit: number;
    global_remaining: number | null;
    reset_date: string | null;
}

const defaultLimits: Record<Plan, number> = { free: 5, basic: 50, pro: 500 };

export async function ensureUserQuota(userId: string, plan: Plan): Promise<UserQuotaRow | null> {
    try {
        await sql`INSERT INTO public.user_quotas (user_id, monthly_limit, used_count, reset_date)
                VALUES (${userId}, ${defaultLimits[plan]}, 0, date_trunc('month', now()) + interval '1 month')
                ON CONFLICT (user_id) DO NOTHING`;

        await sql`UPDATE public.user_quotas
                SET used_count = 0, reset_date = date_trunc('month', now()) + interval '1 month'
                WHERE user_id = ${userId} AND reset_date <= now()`;

        const rows = await sql`SELECT user_id, monthly_limit, used_count, reset_date FROM public.user_quotas WHERE user_id = ${userId} LIMIT 1`;
        const uq = (rows as any[])?.[0] as UserQuotaRow | undefined;
        return uq ?? null;
    } catch {
        return null;
    }
}

export async function ensureGlobalQuota(plan: Plan): Promise<GlobalQuotaRow | null> {
    if (plan === 'free') return null;
    
    const ensure = await sql`SELECT id, quota_limit, remaining, reset_date FROM public.global_quota LIMIT 1`;
    if (!(Array.isArray(ensure) && ensure.length)) {
        await sql`INSERT INTO public.global_quota (quota_limit, remaining, reset_date) VALUES (10000, 10000, date_trunc('month', now()) + interval '1 month')`;
    }
    
    await sql`UPDATE public.global_quota SET remaining = quota_limit, reset_date = date_trunc('month', now()) + interval '1 month' WHERE reset_date <= now()`;
    const rows = await sql`SELECT id, quota_limit, remaining, reset_date FROM public.global_quota LIMIT 1`;
    
    const gq = (rows as any[])?.[0] as GlobalQuotaRow | undefined;
    if (!gq) throw new Error('global_quota_missing');
    
    return gq;
}

export function isUserQuotaExhausted(userQuota: UserQuotaRow | null): boolean {
    if (!userQuota) return false;
    return (userQuota.used_count ?? 0) >= (userQuota.monthly_limit ?? 0);
}

export function isGlobalQuotaExhausted(globalQuota: GlobalQuotaRow | null): boolean {
    if (!globalQuota) return false;
    return (globalQuota.remaining ?? 0) <= 0;
}

export async function getCachedAnalysis(userId: string, handle: string): Promise<{ analysis: any; fetched_at: string } | null> {
    const rows = await sql`SELECT analysis, fetched_at FROM public.competitive_analysis WHERE user_id = ${userId} AND target_handle = ${handle} LIMIT 1`;
    const cached = (rows as any[])?.[0] as { analysis: any; fetched_at: string } | undefined;
    return cached ?? null;
}

export function isCacheFresh(fetchedAt: string | null | undefined, days: number = 7): boolean {
    if (!fetchedAt) return false;
    const ms = days * 24 * 60 * 60 * 1000;
    const ts = new Date(fetchedAt).getTime();
    return Number.isFinite(ts) && (Date.now() - ts) < ms;
}

export async function saveCachedAnalysis(userId: string, handle: string, analysis: any): Promise<void> {
    await sql`INSERT INTO public.competitive_analysis (user_id, target_handle, analysis, fetched_at)
            VALUES (${userId}, ${handle}, ${JSON.stringify(analysis)}::jsonb, now())
            ON CONFLICT (user_id, target_handle) DO UPDATE SET analysis = EXCLUDED.analysis, fetched_at = EXCLUDED.fetched_at`;
}

export async function incrementUsage(userId: string, plan: Plan): Promise<UsageSnapshot> {
    const uqInc = await sql`UPDATE public.user_quotas SET used_count = used_count + 1 WHERE user_id = ${userId} AND used_count < monthly_limit RETURNING used_count, monthly_limit, reset_date`;
    const uq = (uqInc as any[])?.[0] as { used_count: number; monthly_limit: number; reset_date: string } | undefined;
    if (!uq) throw new Error('user_quota_exhausted');

    let globalRemaining: number | null = null;
    let resetDate: string | null = uq.reset_date;
    if (plan !== 'free') {
        const gqDec = await sql`UPDATE public.global_quota SET remaining = remaining - 1 WHERE remaining > 0 AND reset_date > now() RETURNING remaining, reset_date`;
        const gq = (gqDec as any[])?.[0] as { remaining: number; reset_date: string } | undefined;
        if (!gq) throw new Error('global_quota_exhausted');
        globalRemaining = gq.remaining;
        resetDate = gq.reset_date;
    }

    return { user_used: uq.used_count, user_limit: uq.monthly_limit, global_remaining: globalRemaining, reset_date: resetDate };
}

export async function getProfileAndTweets(userId: string, handle: string): Promise<{ profile: any; recentTweets: any[]; metrics: { followers: number; following: number; tweet_count: number } }> {
    const rows = await sql`SELECT user_id, handle, name, description, profile_image_url, followers_count, following_count, tweet_count, last_posts FROM public.twitter_accounts WHERE handle = ${handle} LIMIT 1`;
    let profile = (rows as any[])?.[0] || null;
    let recentTweets: any[] = Array.isArray(profile?.last_posts?.data) ? profile.last_posts.data : [];

    if (!profile) {
        const bearer = await getUserTwitterBearerToken(userId);
        const u = await fetchTwitterUserByUsername(handle, bearer);
        if (!u) throw new Error('not_found');
        profile = {
            user_id: null,
            handle: u.username,
            name: u.name,
            description: u.description,
            profile_image_url: u.profile_image_url,
            followers_count: u.public_metrics?.followers_count ?? 0,
            following_count: u.public_metrics?.following_count ?? 0,
            tweet_count: u.public_metrics?.tweet_count ?? 0,
            last_posts: null,
        };
        recentTweets = await fetchUserTweetsById(u.id, bearer, 10);
    } else if (!recentTweets?.length && profile?.user_id) {
        const t = await sql`SELECT text, created_at FROM public.tweets WHERE user_id = ${profile.user_id} ORDER BY created_at DESC LIMIT 10`;
        recentTweets = (t as any[])?.map((r) => ({ text: r.text, created_at: r.created_at })) || [];
    }

    const metrics = {
        followers: profile?.followers_count || 0,
        following: profile?.following_count || 0,
        tweet_count: profile?.tweet_count || 0,
    };

    return { profile, recentTweets, metrics };
}


