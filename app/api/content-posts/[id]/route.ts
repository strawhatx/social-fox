export const dynamic = 'force-dynamic';
import { resolveUserUuid } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });
    const id = params.id;
    const body = await _req.json();

    if (Object.keys(body).length === 0) return json({ error: 'No updates provided' }, { status: 400 });

    // Only allow updating fields that exist in the model
    const allowedFields = [
      'content', 'platform', 'status', 'scheduledAt', 'postedAt', 'engagement', 'metadata'
    ];
    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    }
    if (Object.keys(updateData).length === 0) return json({ error: 'No valid updates provided' }, { status: 400 });

    const updated = await prisma.contentPost.updateMany({
      where: { id, userId: appUserId },
      data: updateData,
    });
    
    // updateMany returns { count }, so fetch the updated row if count > 0
    let row = null;
    if (updated.count > 0) {
      row = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });
    }
    return json({ data: row });
  } catch (error) {
    console.error('Error updating content_post:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });
    
    const id = params.id;
  await prisma.contentPost.deleteMany({ where: { id, userId: appUserId } });
  return json({ success: true });
  } catch (error) {
    console.error('Error deleting content_post:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
