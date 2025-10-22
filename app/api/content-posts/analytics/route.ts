import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db/data/users';
import { auth } from '@clerk/nextjs/server';
import { createAnalyticsSnapshot } from '@/lib/db/data/analytics_snapshots';

export const dynamic = 'force-dynamic';

/** Utility: JSON response */
function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

/** POST: Create analytics snapshot for a post */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const { postId, snapshotDate, data } = await req.json();

    if (!postId || !snapshotDate || !data) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the post belongs to the user
    const post = await prisma.contentPost.findFirst({
      where: {
        id: postId,
        userId: appUserId,
        status: 'posted',
      },
    });

    if (!post) {
      return json({ error: 'Post not found or not posted' }, { status: 404 });
    }

    const snapshot = await createAnalyticsSnapshot(
      postId,
      new Date(snapshotDate),
      data
    );

    return json({ data: snapshot }, { status: 201 });
  } catch (err) {
    console.error('Error creating analytics snapshot:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** GET: Get snapshots for a post */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const url = new URL(req.url);
    const postId = url.searchParams.get('postId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!postId) {
      return json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify the post belongs to the user
    const post = await prisma.contentPost.findFirst({
      where: {
        id: postId,
        userId: appUserId,
      },
    });

    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        postId,
        ...(startDate && endDate && {
          snapshotDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { snapshotDate: 'asc' },
    });

    return json({ data: snapshots });
  } catch (err) {
    console.error('Error fetching analytics snapshots:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
