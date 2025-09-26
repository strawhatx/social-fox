import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function authenticateAWS(request: Request) {
  const apiKey = request.headers.get('scheduler-secret')
  const expectedKey = process.env.SCHEDULER_SECRET
  if (!expectedKey) {
    throw new Error('SCHEDULER_SECRET not configured')
  }
  if (!apiKey || apiKey !== expectedKey) {
    return false
  }
  return true
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

export async function GET(request: Request) {
  try {
    const isAuthenticated = await authenticateAWS(request)
    if (!isAuthenticated) {
      return json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = Math.max(1, Math.min(Number(limitParam ?? 50), 200))

    const duePosts = await prisma.contentPost.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { lte: now },
      },
      include: {
        user: { select: { clerkUserId: true } },
      },
      orderBy: [{ scheduledAt: { sort: 'asc', nulls: 'last' } }],
      take: limit,
    })

    const result = duePosts.map((p) => ({ id: p.id, clerkUserId: p.user?.clerkUserId ?? null }))
    return json({ ok: true, data: result })
  } catch (error) {
    console.error('Error in scheduler route:', error)
    return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 })
  }
}


