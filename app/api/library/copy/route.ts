import { NextRequest, NextResponse } from 'next/server';
import { sql, resolveUserUuid } from '@/lib/db';
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
    const templateResult = await sql`
      SELECT text, category, hashtags, is_viral_ready
      FROM public.library 
      WHERE id = ${templateId} AND is_starter = true
    `;

    if ((templateResult as any[]).length === 0) {
      return NextResponse.json({ error: 'Starter template not found' }, { status: 404 });
    }

    const template = (templateResult as any[])[0];

    // Check if user already has this template
    const existingResult = await sql`
      SELECT id FROM public.library 
      WHERE user_id = ${appUserId} AND text = ${template.text} AND is_starter = false
    `;

    if ((existingResult as any[]).length > 0) {
      return NextResponse.json({ error: 'Template already exists in your library' }, { status: 409 });
    }

    // Copy the template to user's library
    const result = await sql`
      INSERT INTO public.library (user_id, text, category, hashtags, is_viral_ready, is_starter)
      VALUES (${appUserId}, ${template.text}, ${template.category}, ${template.hashtags}, ${template.is_viral_ready}, false)
      RETURNING id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
    `;

    return NextResponse.json({ template: (result as any[])[0] }, { status: 201 });
  } catch (error) {
    console.error('Error copying template to library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}