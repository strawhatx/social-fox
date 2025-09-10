import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { resolveUserUuid } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    const appUserId = await resolveUserUuid(userId);
    
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    const templates = await prisma.aiTemplate.findMany({
      where: { userId: appUserId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        text: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, tweets: templates });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


