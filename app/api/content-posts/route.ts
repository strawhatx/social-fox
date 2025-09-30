import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId} = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    // Parse query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const posts = await prisma.contentPost.findMany({
      where: {
        userId: appUserId,
        ...(status && { status })
      },
      orderBy: [
        { scheduledAt: { sort: 'asc', nulls: 'last' } }
      ]
    });

    return json({ data: posts });
  } catch (error) {
    console.error('Error listing content_posts:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { content, platform = 'twitter', scheduled_at, status = 'draft', attachments, communityUrl } = body;

    if (!content || !content.trim()) {
      return json({ error: 'Content is required' }, { status: 400 });
    }

    // Determine status based on scheduled_at
    const finalStatus = scheduled_at ? 'scheduled' : status;

    const result = await prisma.contentPost.create({
      data: {
        userId: appUserId,
        content: content.trim(),
        platform: platform,
        status: finalStatus,
        scheduledAt: scheduled_at ? new Date(scheduled_at) : null,
        metadata: {
          attachments: attachments || [],
          community_url: communityUrl
        }
      }
    });

    return json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating content_post:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
