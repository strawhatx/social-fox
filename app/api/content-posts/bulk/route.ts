import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { items } = body as { items: Array<{ content: string; scheduled_at?: string | null; platform?: string; metadata?: any }>; };
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: 'No items provided' }, { status: 400 });
    }

    const toCreate = items.map((i) => ({
      userId: appUserId,
      content: (i.content || '').trim(),
      platform: i.platform || 'twitter',
      status: i.scheduled_at ? 'scheduled' : 'draft',
      scheduledAt: i.scheduled_at ? new Date(i.scheduled_at) : null,
      metadata: i.metadata || {},
    })).filter((r) => r.content.length > 0);

    if (toCreate.length === 0) return json({ error: 'No valid content' }, { status: 400 });

    const created = await prisma.contentPost.createMany({ data: toCreate });
    return json({ success: true, count: created.count });
  } catch (err) {
    console.error('Error bulk creating content_posts:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}


