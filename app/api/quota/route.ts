import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { resolveUserUuid } from '@/lib/db';
import { prisma } from '@/lib/prisma';

async function readQuotaSnapshot(appUserId: string) {
  const quota = await prisma.userQuota.findUnique({
    where: { userId: appUserId }
  });
  return { user: quota };
}

// get quota
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });

    const quota = await readQuotaSnapshot(appUserId);
    return NextResponse.json({ ok: true, quota });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}

// increment usage by 1 for specific quota type
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });

    const body = await request.json();
    const { type = 'ai_posts' } = body; // Default to ai_posts for chat conversations

    // First, get the current quota to check limits
    const currentQuota = await prisma.userQuota.findUnique({
      where: { userId: appUserId }
    });

    if (!currentQuota) {
      return NextResponse.json({ ok: false, error: 'user_quota_not_found' }, { status: 404 });
    }

    // Check if quota is expired
    if (currentQuota.resetDate <= new Date()) {
      return NextResponse.json({ ok: false, error: 'quota_expired' }, { status: 402 });
    }

    let updatedQuota: any;

    switch (type) {
      case 'posts':
        if (currentQuota.postsUsed >= currentQuota.postsLimit) {
          return NextResponse.json({ ok: false, error: 'user_quota_exhausted' }, { status: 402 });
        }
        updatedQuota = await prisma.userQuota.update({
          where: { userId: appUserId },
          data: { postsUsed: { increment: 1 } }
        });
        break;
      case 'ai_posts':
        if (currentQuota.aiPostsUsed >= currentQuota.aiPostsLimit) {
          return NextResponse.json({ ok: false, error: 'user_quota_exhausted' }, { status: 402 });
        }
        updatedQuota = await prisma.userQuota.update({
          where: { userId: appUserId },
          data: { aiPostsUsed: { increment: 1 } }
        });
        break;
      case 'ai_rewrites':
        if (currentQuota.aiRewritesUsed >= currentQuota.aiRewritesLimit) {
          return NextResponse.json({ ok: false, error: 'user_quota_exhausted' }, { status: 402 });
        }
        updatedQuota = await prisma.userQuota.update({
          where: { userId: appUserId },
          data: { aiRewritesUsed: { increment: 1 } }
        });
        break;
      default:
        return NextResponse.json({ ok: false, error: 'invalid_quota_type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, quota: { user: updatedQuota } });
  } catch (error) {
    console.error('Quota increment error:', error);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}


