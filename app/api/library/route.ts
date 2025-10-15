import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resolveUserUuid } from '@/lib/db';
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

    // Build where conditions based on library type
    let whereCondition: any = {};
    
    if (libraryType === 'starter') {
      whereCondition.isStarter = true;
    } else if (libraryType === 'user') {
      whereCondition.userId = appUserId;
      whereCondition.isStarter = false;
    } else {
      // Get both starter and user templates
      whereCondition.OR = [
        { isStarter: true },
        { userId: appUserId, isStarter: false }
      ];
    }

    // Add category filter if specified
    if (category && category !== 'All Templates') {
      if (whereCondition.OR) {
        // For mixed queries, add category to both conditions
        whereCondition.OR = whereCondition.OR.map((condition: any) => ({
          ...condition,
          category
        }));
      } else {
        whereCondition.category = category;
      }
    }

    // Get templates and total count
    const [templates, total] = await Promise.all([
      prisma.library.findMany({
        where: whereCondition,
        orderBy: libraryType === 'all' 
          ? [{ isStarter: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          text: true,
          category: true,
          hashtags: true,
          isViralReady: true,
          isStarter: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.library.count({
        where: whereCondition
      })
    ]);

    return NextResponse.json({
      templates,
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

    const template = await prisma.library.create({
      data: {
        userId: appUserId,
        text,
        category,
        hashtags,
        isViralReady: is_viral_ready,
        isStarter: false
      },
      select: {
        id: true,
        text: true,
        category: true,
        hashtags: true,
        isViralReady: true,
        isStarter: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ template }, { status: 201 });
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

    const template = await prisma.library.updateMany({
      where: {
        id,
        userId: appUserId,
        isStarter: false
      },
      data: {
        text,
        category,
        hashtags,
        isViralReady: is_viral_ready
      }
    });

    if (template.count === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Fetch the updated template
    const updatedTemplate = await prisma.library.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        category: true,
        hashtags: true,
        isViralReady: true,
        isStarter: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ template: updatedTemplate });
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

    const result = await prisma.library.deleteMany({
      where: {
        id,
        userId: appUserId,
        isStarter: false
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting library template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}