import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { getUserTwitterBearerToken, fetchXCommunityById } from '../_lib/twitter';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const rows = await sql`SELECT id, name FROM public.user_communities WHERE user_id = ${userId} ORDER BY name`;
  return NextResponse.json({ ok: true, communities: rows });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  
  const body = await request.json().catch(() => ({}));
  
  const communityUrl = String(body?.communityUrl || '').trim();
  if (!communityUrl) return NextResponse.json({ ok: false, error: 'communityUrl required' }, { status: 400 });

  // Extract X community id from URL
  const match = communityUrl.match(/communities\/(\d+)/);
  const communityId = match?.[1];
  if (!communityId) return NextResponse.json({ ok: false, error: 'invalid community url' }, { status: 400 });

  // Try to fetch name/details from X
  const bearer = await getUserTwitterBearerToken(userId);
  const meta = await fetchXCommunityById(communityId, bearer);
  const name = meta?.name || `Community ${communityId}`;

  const rows = await sql`INSERT INTO public.user_communities (user_id, community_id, name) VALUES (${userId}, ${communityId}, ${name}) RETURNING id, name`;
  const community = (rows as any[])?.[0] || null;
  return NextResponse.json({ ok: true, community });
}


