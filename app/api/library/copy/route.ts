import { NextRequest, NextResponse } from 'next/server';
import { resolveUserUuid } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // First, get the starter template
    const template = await prisma.library.findFirst({
      where: { id: templateId, isStarter: true },
      select: {
        text: true,
        category: true,
        hashtags: true,
        isViralReady: true,
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Starter template not found' }, { status: 404 });
    }

    // Check if user already has this template
    const existing = await prisma.library.findFirst({
      where: { userId: appUserId, text: template.text, isStarter: false },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: 'Template already exists in your library' }, { status: 409 });
    }

    // Copy the template to user's library
    const created = await prisma.library.create({
      data: {
        userId: appUserId,
        text: template.text,
        category: template.category,
        hashtags: template.hashtags,
        isViralReady: template.isViralReady,
        isStarter: false,
      },
      select: {
        id: true,
        text: true,
        category: true,
        hashtags: true,
        isViralReady: true,
        isStarter: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ template: created }, { status: 201 });
  } catch (error) {
    console.error('Error copying template to library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}