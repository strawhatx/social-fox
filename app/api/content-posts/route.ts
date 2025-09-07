import { sql, resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { userId} = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const rows = await sql`
      select *
      from content_posts
      where user_id = ${appUserId}
      order by scheduled_at asc nulls last
    `;

    return json({ data: rows });
  } catch (error) {
    console.error('Error listing content_posts:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
