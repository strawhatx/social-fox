import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

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

    // Get the most recent user message
    const lastUserMessage = await prisma.message.findFirst({
      where: {
        conversationId,
        role: 'user'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastUserMessage) {
      return NextResponse.json({ error: 'No user message found to resend' }, { status: 404 });
    }

    // Check if there's already a pending assistant message for this user message
    const existingPendingMessage = await prisma.message.findFirst({
      where: {
        conversationId,
        role: 'assistant',
        status: 'pending',
        createdAt: {
          gt: lastUserMessage.createdAt
        }
      }
    });

    if (existingPendingMessage) {
      // Return the existing pending message
      return NextResponse.json({ 
        messages: [{
          id: existingPendingMessage.id,
          role: existingPendingMessage.role,
          content: existingPendingMessage.content,
          timestamp: existingPendingMessage.createdAt,
          status: 'pending'
        }]
      });
    }

    // Create new pending assistant message
    const now = new Date();
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: { }, // Will be filled by the AI service
        status: 'pending',
        createdAt: new Date(now.getTime() + 1), // Ensure ordering after user message
        updatedAt: new Date(now.getTime() + 1)
      }
    });

    return NextResponse.json({ 
      messages: [{
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.createdAt,
        status: 'pending'
      }]
    });

  } catch (error) {
    console.error('Error in /api/messages/resend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
