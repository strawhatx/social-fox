import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db/data/users';
import { auth } from '@clerk/nextjs/server';
import { generateJsonFromPrompt } from '@/lib/ai/text';

export const dynamic = 'force-dynamic';

function json(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

        const appUserId = await resolveUserUuid(userId);
        if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

        const url = new URL(req.url);
        const timeRange = url.searchParams.get('timeRange') || '14d';

        const now = new Date();
        let startDate: Date;
        switch (timeRange) {
            case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
            case '14d': startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); break;
            case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
            default: startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        }

        const posts = await prisma.contentPost.findMany({
            where: { userId: appUserId, status: 'posted', postedAt: { gte: startDate, lte: now } },
            include: { items: true },
            orderBy: { postedAt: 'asc' },
        });

        const snapshots = await prisma.analyticsSnapshot.findMany({
            where: { snapshotDate: { gte: startDate, lte: now }, item: { post: { userId: appUserId } } },
            include: { item: { include: { post: true } } },
            orderBy: { snapshotDate: 'asc' },
        });

        const byPost: Record<string, typeof snapshots> = {} as any;
        for (const s of snapshots) {
            const pid = s.item?.post?.id;
            if (!pid) continue;
            (byPost[pid] ||= []).push(s);
        }

        const perPost = posts.map(p => {
            const snaps = byPost[p.id] || [];
            const latestByItem: Record<string, { likes: number; retweets: number; replies: number; impressions: number }> = {};
            for (const s of snaps) {
                latestByItem[s.item!.id] = { likes: s.likes, retweets: s.retweets, replies: s.replies, impressions: s.impressions || 0 };
            }
            const agg = Object.values(latestByItem).reduce((a, c) => ({ likes: a.likes + c.likes, retweets: a.retweets + c.retweets, replies: a.replies + c.replies, impressions: a.impressions + c.impressions }), { likes: 0, retweets: 0, replies: 0, impressions: 0 });
            const interactions = agg.likes + agg.retweets + agg.replies;
            const engagement = agg.impressions > 0 ? (interactions / agg.impressions) * 100 : 0;
            return {
                id: p.id,
                content: p.items?.[0]?.content || '',
                date: p.postedAt ? (p.postedAt as Date).toISOString().split('T')[0] : '',
                likes: agg.likes,
                retweets: agg.retweets,
                replies: agg.replies,
                impressions: agg.impressions,
                engagement: Math.round(engagement * 10) / 10,
                isThread: (p.items || []).length > 1,
                hasGif: (p.items || []).some((it: any) => (it.media || []).some((m: any) => m?.type === 'image/gif')),
                hasImage: (p.items || []).some((it: any) => (it.media || []).some((m: any) => (m?.type || '').startsWith('image/') && m?.type !== 'image/gif')),
                length: (p.items?.[0]?.content || '').length,
            };
        });

        if (!perPost.length) {
            return json({ top_post: null, bottom_post: null, recommendations: [] });
        }

        const top = [...perPost].sort((a, b) => b.engagement - a.engagement)[0];
        const bottom = [...perPost].sort((a, b) => a.engagement - b.engagement)[0];

        // Build concise context for AI
        const compact = perPost.slice(0, 20).map(p => ({ id: p.id, engagement: p.engagement, impressions: p.impressions, likes: p.likes, retweets: p.retweets, replies: p.replies, isThread: p.isThread, hasGif: p.hasGif, hasImage: p.hasImage, length: p.length })).slice(0, 20);

        // 1) Reasons + actions for top/bottom
        const reasonPrompt = [
            { role: 'system', content: 'Return ONLY JSON. Be concise and actionable. No code fences.' },
            {
                role: 'user', content: `Analyze the following recent posts and engagement metrics. Identify why the TOP and BOTTOM post performed as they did, and give 1 short actionable improvement each (max 1 sentence).

Posts (compact): ${JSON.stringify(compact)}

Top post: { id: "${top.id}", length: ${top.length}, isThread: ${top.isThread}, hasGif: ${top.hasGif}, hasImage: ${top.hasImage}, engagement: ${top.engagement} }
Bottom post: { id: "${bottom.id}", length: ${bottom.length}, isThread: ${bottom.isThread}, hasGif: ${bottom.hasGif}, hasImage: ${bottom.hasImage}, engagement: ${bottom.engagement} }

Return JSON exactly:
{ "top_post": { "id": "...", "reason": "...", "action": "..." }, "bottom_post": { "id": "...", "reason": "...", "action": "..." } }` }
        ];

        let top_post: any = { id: top.id, reason: '', action: '' };
        let bottom_post: any = { id: bottom.id, reason: '', action: '' };
        try {
            const resp = await generateJsonFromPrompt(reasonPrompt, 0.3);
            const parsed = JSON.parse(resp || '{}');
            if (parsed?.top_post?.id && parsed?.bottom_post?.id) {
                top_post = { id: parsed.top_post.id, reason: parsed.top_post.reason || '', action: parsed.top_post.action || '' };
                bottom_post = { id: parsed.bottom_post.id, reason: parsed.bottom_post.reason || '', action: parsed.bottom_post.action || '' };
            }
        } catch { }

        // 2) Recommendations
        const recPrompt = [
            { role: 'system', content: 'Return ONLY JSON. No preamble.' },
            {
                role: 'user', content: `Analyze the last 14 days of posts and engagement (compact below). Generate 3 short recommendations to improve content performance. Each should be a single actionable sentence, not generic.

Compact posts: ${JSON.stringify(compact)}

Return JSON: { "recommendations": ["...", "...", "..."] }` }
        ];
        let recommendations: string[] = [];
        try {
            const resp = await generateJsonFromPrompt(recPrompt, 0.4);
            const parsed = JSON.parse(resp || '{}');
            if (Array.isArray(parsed?.recommendations)) recommendations = parsed.recommendations.slice(0, 3);
        } catch { }

        // Fallbacks if AI fails
        if (!top_post?.reason) top_post.reason = 'Strong hook and clear value early on.';
        if (!top_post?.action) top_post.action = 'Create 3 more posts with a similar hook and tone.';
        if (!bottom_post?.reason) bottom_post.reason = 'Too long with no clear hook or CTA.';
        if (!bottom_post?.action) bottom_post.action = 'Shorten to one idea and add a question as a hook.';
        if (!recommendations.length) recommendations = ['Post 3 concise tweets with a question hook this week.', 'Add a GIF to 2 posts to boost engagement.', 'Schedule posts between 9 AM and 12 PM on your best days.'];

        return json({ top_post, bottom_post, recommendations });
    } catch (err) {
        console.error('Error fetching analytics insights:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}


