import { NextRequest, NextResponse } from 'next/server';
import { sql, resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const libraryType = searchParams.get('type') || 'all'; // 'starter', 'user', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;
    let totalResult;

    if (libraryType === 'starter') {
      // Get only starter templates
      if (category && category !== 'All Templates') {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE is_starter = true AND category = ${category}
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE is_starter = true AND category = ${category}
        `;
      } else {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE is_starter = true
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE is_starter = true
        `;
      }
    } else if (libraryType === 'user') {
      // Get only user templates
      if (category && category !== 'All Templates') {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE user_id = ${appUserId} AND is_starter = false AND category = ${category}
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE user_id = ${appUserId} AND is_starter = false AND category = ${category}
        `;
      } else {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE user_id = ${appUserId} AND is_starter = false
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE user_id = ${appUserId} AND is_starter = false
        `;
      }
    } else {
      // Get both starter and user templates
      if (category && category !== 'All Templates') {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE (is_starter = true OR (user_id = ${appUserId} AND is_starter = false)) AND category = ${category}
          ORDER BY is_starter DESC, created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE (is_starter = true OR (user_id = ${appUserId} AND is_starter = false)) AND category = ${category}
        `;
      } else {
        result = await sql`
          SELECT id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
          FROM public.library 
          WHERE is_starter = true OR (user_id = ${appUserId} AND is_starter = false)
          ORDER BY is_starter DESC, created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
        totalResult = await sql`
          SELECT COUNT(*) as total FROM public.library 
          WHERE is_starter = true OR (user_id = ${appUserId} AND is_starter = false)
        `;
      }
    }

    const total = parseInt((totalResult as any[])[0]?.total || '0');

    return NextResponse.json({
      templates: result,
      total,
      limit,
      offset,
      libraryType
    });
  } catch (error) {
    console.error('Error fetching library templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { text, category, hashtags = [], is_viral_ready = false } = body;

    if (!text || !category) {
      return NextResponse.json({ error: 'Text and category are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO public.library (user_id, text, category, hashtags, is_viral_ready, is_starter)
      VALUES (${appUserId}, ${text}, ${category}, ${hashtags}, ${is_viral_ready}, false)
      RETURNING id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
    `;

    return NextResponse.json({ template: (result as any[])[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating library template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, text, category, hashtags, is_viral_ready } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE public.library 
      SET text = ${text}, category = ${category}, hashtags = ${hashtags}, is_viral_ready = ${is_viral_ready}, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${appUserId} AND is_starter = false
      RETURNING id, text, category, hashtags, is_viral_ready, is_starter, created_at, updated_at
    `;

    if ((result as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: (result as any[])[0] });
  } catch (error) {
    console.error('Error updating library template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM public.library WHERE id = ${id} AND user_id = ${appUserId} AND is_starter = false RETURNING id
    `;

    if ((result as any[]).length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting library template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}