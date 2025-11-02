import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiRewrite } from '@/lib/ai/text';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const text: string = body?.text ?? '';
    const style: string | undefined = body?.style;

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    const rewritten = await aiRewrite(text, style);
    return Response.json({ rewritten });
  } 
  catch (e) {
    console.error('Rewrite API error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}