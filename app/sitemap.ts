import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://socialfox.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // Dynamic marketing pages
    const marketingPages = await prisma.marketingPage.findMany({
      where: { published: true },
      select: {
        type: true,
        slug: true,
        updatedAt: true,
      },
    });

    const dynamicPages: MetadataRoute.Sitemap = marketingPages.map((page) => ({
      url: `${baseUrl}/${page.type}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly',
      priority: page.type === 'comparison' ? 0.9 : 0.7, // Comparison pages get higher priority
    }));

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
