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
      description: page.metaDescription || page.subtitle,
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.subtitle,
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

    return <BlogPageTemplate page={page} />;
  } catch (error) {
    console.error('Error fetching marketing page:', error);
    notFound();
  }
}
