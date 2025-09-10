import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages for conversation
    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, content, metadata } = await request.json();

    if (!role || !content) {
      return NextResponse.json({ error: 'Role and content are required' }, { status: 400 });
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check quota for assistant messages
    if (role === 'assistant') {
      const quota = await prisma.userQuota.findUnique({
        where: { userId: user.id }
      });
      
      if (quota && quota.aiPostsUsed >= quota.aiPostsLimit) {
        return NextResponse.json({ error: 'Quota exceeded' }, { status: 402 });
      }
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        role,
        content: content.trim(),
        metadata: metadata || {}
      }
    });

    // Increment quota for assistant messages
    if (role === 'assistant') {
      await prisma.userQuota.update({
        where: { userId: user.id },
        data: { aiPostsUsed: { increment: 1 } }
      });
    }

    // Update conversation's updated_at timestamp
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
