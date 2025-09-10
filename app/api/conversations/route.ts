import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';

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

    // Get conversations with messages ordered by updated_at
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, firstMessage } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check quota before creating conversation (only if there's a first message)
    if (firstMessage) {
      const quota = await prisma.userQuota.findUnique({
        where: { userId: user.id }
      });
      
      if (quota && quota.aiPostsUsed >= quota.aiPostsLimit) {
        return NextResponse.json({ error: 'Quota exceeded' }, { status: 402 });
      }
    }

    // Create new conversation with first message if provided
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title.trim(),
        messages: firstMessage ? {
          create: {
            role: firstMessage.role,
            content: firstMessage.content,
            metadata: firstMessage.metadata || {}
          }
        } : undefined
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Increment quota if first message was created
    if (firstMessage) {
      await prisma.userQuota.update({
        where: { userId: user.id },
        data: { aiPostsUsed: { increment: 1 } }
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
