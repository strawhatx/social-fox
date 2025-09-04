import { auth } from '@clerk/nextjs/server';
import { getUserTwitterBearerToken } from '../_lib/twitter';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q || q.length < 2) return Response.json({ communities: [] });

  const token = await getUserTwitterBearerToken(userId);
  if (!token) return Response.json({ communities: [] });

  try {
    const endpoint = `https://api.twitter.com/2/communities/search?max_results=10&query=${encodeURIComponent(q)}`;
    const resp = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'social-story-shaper/1.0'
      },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return Response.json({ error: 'upstream_error', detail: text }, { status: 502 });
    }

    const data = await resp.json();
   
    // Normalize results
    const communities = (data?.data || []).map((c: any) => ({
      id: String(c.id ?? c.community_id ?? ''),
      name: String(c.name ?? c.title ?? 'Community'),
      platform: 'X',
    }));
    
    return Response.json({ communities });
  } catch (e) {
    return Response.json({ error: 'search_failed' }, { status: 500 });
  }
}


