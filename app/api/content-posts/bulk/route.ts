import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db/data/users';
import { bulkPostGeneration } from '@/lib/ai/text';

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
    const { startDate, audience, subject, tone, goals, mediaMode = 'gifs' } = body as { 
      startDate: string; 
      audience: string; 
      subject: string; 
      tone: string; 
      goals: string; 
      mediaMode?: 'text' | 'gifs' | 'images';
    };
    if (!startDate || !audience || !subject) {
      return json({ error: 'Missing required fields: startDate, audience, subject' }, { status: 400 });
    }

    const { posts } = await bulkPostGeneration(audience, subject, tone, goals, mediaMode);
    if (!Array.isArray(posts) || posts.length === 0) {
      return json({ error: 'No posts generated' }, { status: 400 });
    }

    // Start scheduling the day after the requested date at 9 AM
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start the day after
    currentDate.setHours(9, 0, 0, 0); // Set to 9:00 AM

    // Create posts and items transactionally, maintaining item ordering via parentId
    const createdIds = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const scheduledAt = new Date(currentDate);

        const createdPost = await tx.contentPost.create({
          data: {
            userId: appUserId,
            platform: 'x',
            status: 'scheduled',
            scheduledAt,
            items: {
              create: {
                content: String(post?.text || '').trim(),
                media: [{ url: post?.image || '', type: 'image' }],
                metadata: { attachments: [] },
              },
            },
          },
        });

        ids.push(createdPost.id);
        currentDate.setDate(currentDate.getDate() + 1); // stagger schedule by 1 day
        currentDate.setHours(9, 0, 0, 0); // Ensure next day is also at 9 AM
      }
      return ids;
    });

    return json({ success: true, count: createdIds.length, ids: createdIds });
  } catch (err) {
    console.error('Error bulk creating content_posts:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}


