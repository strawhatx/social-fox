import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const page = await prisma.marketingPage.findUnique({
      where: { slug }
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching marketing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Check if page exists
    const existingPage = await prisma.marketingPage.findUnique({
      where: { slug }
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const {
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
      published
    } = body;

    // If publishing for the first time, set publishedAt
    const shouldSetPublishedAt = published && !existingPage.published;

    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(heroImage !== undefined && { heroImage }),
        ...(features !== undefined && { features }),
        ...(ctaText && { ctaText }),
        ...(ctaLink && { ctaLink }),
        ...(content && { content }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(published !== undefined && { published }),
        ...(shouldSetPublishedAt && { publishedAt: new Date() })
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error updating marketing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const page = await prisma.marketingPage.findUnique({
      where: { slug }
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.marketingPage.delete({
      where: { slug }
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting marketing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
