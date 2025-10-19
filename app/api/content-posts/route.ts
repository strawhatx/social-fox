
import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { createScheduledPost } from '@/lib/db/data/content_posts';

export const dynamic = 'force-dynamic';

/** Utility: JSON response */
function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

/** GET: list posts */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const url = new URL(req.url);
    const status = url.searchParams.get('status') ?? undefined;
    const monthParam = url.searchParams.get('month'); // 1-12
    const yearParam = url.searchParams.get('year'); // full year, e.g. 2025

    const now = new Date();
    const month = Math.min(12, Math.max(1, monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1));
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const startOfNextMonth = new Date(year, month, 1, 0, 0, 0, 0);

    const posts = await prisma.contentPost.findMany({
      where: {
        userId: appUserId,
        ...(status && { status }),
        // Return posts scheduled within the requested month
        scheduledAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ scheduledAt: { sort: 'asc', nulls: 'last' } }],
    });

    return json({ data: posts });
  } catch (err) {
    console.error('Error listing content_posts:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST: initalize calendar scheduled post */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const { scheduled_at } = await req.json();

    if (!scheduled_at) return json({ error: 'Scheduled at is required' }, { status: 400 });

    const post = await createScheduledPost(appUserId, { platform: 'x', scheduled_at });

    return json({ data: post }, { status: 201 });

  } catch (err) {
    console.error('Error creating content_post:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}