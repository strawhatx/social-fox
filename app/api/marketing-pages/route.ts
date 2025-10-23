import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const type = searchParams.get('type');
    const published = searchParams.get('published') === 'true';

    if (slug) {
      // Get single page by slug
      const page = await prisma.marketingPage.findUnique({
        where: { slug }
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      return NextResponse.json(page);
    }

    // Get all pages with optional filters
    const where: any = {};
    if (type) where.type = type;
    if (published) where.published = true;

    const pages = await prisma.marketingPage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching marketing pages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      type,
      title,
      subtitle,
      heroImage,
      features,
      ctaText,
      ctaLink,
      content,
      metaTitle,
      metaDescription,
      published = false
    } = body;

    // Validate required fields
    if (!slug || !type || !title || !ctaText || !ctaLink || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await prisma.marketingPage.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.marketingPage.create({
      data: {
        slug,
        type,
        title,
        subtitle,
        heroImage,
        features: features || [],
        ctaText,
        ctaLink,
        content,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || subtitle,
        published,
        publishedAt: published ? new Date() : null
      }
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Error creating marketing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
