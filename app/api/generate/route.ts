import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiGenerate } from '@/lib/ai/text';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const prompt: string = body?.prompt ?? '';

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const generated = await aiGenerate(prompt);
    return Response.json({ generated });
  } 
  catch (e) {
    console.error('Generate API error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

