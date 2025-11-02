import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, retry, messageId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Handle retry functionality
    if (retry && messageId) {
      // Update the failed assistant message status to pending
      await prisma.message.update({
        where: { id: messageId },
        data: { 
          status: 'pending',
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({ success: true });
    }

    // Handle new message creation
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const now = new Date();
    const messages = [];

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: {
          text: content.trim()
        },
        status: 'done',
        createdAt: now,
        updatedAt: now
      }
    });

    messages.push({
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content as any,
      timestamp: userMessage.createdAt,
      status: userMessage.status
    });

    // Create pending assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: {},
        status: 'pending',
        createdAt: new Date(now.getTime() + 1), // Ensure ordering
        updatedAt: new Date(now.getTime() + 1)
      }
    });

    messages.push({
      id: assistantMessage.id,
      role: assistantMessage.role,
      content: assistantMessage.content as any,
      timestamp: assistantMessage.createdAt,
      status: assistantMessage.status
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error in /api/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
          userId: user.id
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
      status: 'done' // Default status for UI
    }));

    return NextResponse.json({ messages: formattedMessages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
