import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { withQuotaCheck } from '@/lib/quota-middleware';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get conversations ordered by updated_at
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withQuotaCheck('copilotDrafts', async (request, context, user, usage) => {
  try {
    const body = await request.json().catch(() => ({}));
    const initialMessage: string | undefined = typeof body?.initialMessage === 'string' ? body.initialMessage : undefined;

    const titleFromMessage = (text: string) => {
      const words = text.trim().split(/\s+/).slice(0, 10);
      const title = words.join(' ');
      return title.length > 0 ? `${title}...` : 'New Conversation';
    };

    // Create new conversation with derived title when provided
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: initialMessage ? titleFromMessage(initialMessage) : 'New Conversation',
        status: 'draft'
      }
    });

    return NextResponse.json({
      ...conversation,
      usage: {
        used: usage.used,
        limit: usage.limit
      }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
