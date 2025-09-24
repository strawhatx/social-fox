import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateJsonFromPrompt } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, conversationId } = body;

    if (!messageId || !conversationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // 1️⃣ Mark assistant message as processing
    await prisma.message.update({
      where: { id: messageId },
      data: { 
        status: 'processing',
        updatedAt: new Date()
      }
    });

    // 2️⃣ Fetch last 25 conversation messages (user + assistant, excluding pending)
    const historyMessages = await prisma.message.findMany({
      where: {
        conversationId,
        status: 'done'
      },
      orderBy: { createdAt: 'desc' },
      take: 25
    });

    const conversationHistory = historyMessages.reverse().map((m) => ({
      role: m.role,
      content: typeof m.content === 'object' && m.content !== null 
        ? JSON.stringify(m.content)
        : String(m.content || '')
    }));

    // 3️⃣ Call AI to generate response
    const aiResponse = await generateJsonFromPrompt(conversationHistory);

    console.log('AI response:', aiResponse);

    // 4️⃣ Parse AI response and update assistant message
    let parsedContent;
    try {
      parsedContent = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Fallback to plain text if JSON parsing fails
      parsedContent = { text: aiResponse };
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { 
        content: parsedContent,
        status: 'done',
        updatedAt: new Date()
      }
    });

    // 5️⃣ Return AI message to client
    return NextResponse.json({
      id: messageId,
      role: 'assistant',
      content: parsedContent,
      status: 'done'
    });

  } catch (error) {
    console.error('❌ Error processing AI message:', error);

    // Attempt to mark message as error
    try {
      const body = await request.json();
      const { messageId } = body;
      if (messageId) {
        await prisma.message.update({
          where: { id: messageId },
          data: { 
            status: 'error',
            updatedAt: new Date()
          }
        });
      }
    } catch {}

    return NextResponse.json({
      role: 'assistant',
      content: { text: 'Failed to generate message.' },
      status: 'error'
    }, { status: 500 });
  }
}
