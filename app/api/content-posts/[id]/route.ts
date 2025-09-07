export const dynamic = 'force-dynamic';
import { sql, resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });
    const id = params.id;
    const body = await _req.json();

    const keys = Object.keys(body);
    if (keys.length === 0) return json({ error: 'No updates provided' }, { status: 400 });

    const assignments = keys
      .map((k, i) => sql`${sql.unsafe(k)} = ${body[k as keyof typeof body]}`)
      .reduce((acc, curr, i) => (i === 0 ? curr : sql`${acc}, ${curr}`));

    const rows = await sql`update content_posts set ${assignments} where id = ${id} and user_id = ${appUserId} returning *`;
    const row = rows[0] || null;
    return json({ data: row });
  } catch (error) {
    console.error('Error updating content_post:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
    
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });
    
    const id = params.id;
    await sql`delete from content_posts where id = ${id} and user_id = ${appUserId}`;
    
    return json({ success: true });
  } catch (error) {
    console.error('Error deleting content_post:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
