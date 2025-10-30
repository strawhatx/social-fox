import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import BlogPageTemplate from '@/components/blog/page-template';

interface PageProps {
  params: { type: string; slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const page = await prisma.blogPage.findUnique({
      where: { 
        slug: params.slug,
        type: params.type,
        published: true 
      }
    });

    if (!page) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.'
      };
    }

    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription ?? page.subtitle ?? undefined,
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDescription ?? page.subtitle ?? undefined,
        images: page.heroImage ? [{ url: page.heroImage }] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    };
  }
}

export default async function BlogPage({ params }: PageProps) {
  try {
    const page = await prisma.blogPage.findUnique({
      where: { 
        slug: params.slug,
        type: params.type,
        published: true 
      }
    });

    if (!page) {
      notFound();
    }

    const normalizedPage = {
      ...page,
      subtitle: page.subtitle ?? undefined,
      heroImage: page.heroImage ?? undefined,
      metaTitle: page.metaTitle ?? undefined,
      metaDescription: page.metaDescription ?? undefined,
      publishedAt: page.publishedAt
        ? (typeof page.publishedAt === 'string' ? page.publishedAt : page.publishedAt.toISOString())
        : undefined,
      createdAt: typeof page.createdAt === 'string' ? page.createdAt : page.createdAt.toISOString(),
      updatedAt: typeof page.updatedAt === 'string' ? page.updatedAt : page.updatedAt.toISOString(),
      features: Array.isArray(page.features) ? (page.features as any[]) : undefined,
    } as const;

    return <BlogPageTemplate page={normalizedPage as any} />;
  } catch (error) {
    console.error('Error fetching marketing page:', error);
    notFound();
  }
}
