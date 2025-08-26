import { Helmet } from 'react-helmet-async';
import { generateSEOTags, SEOConfig } from '@/lib/seo';

interface SEOHeadProps {
  pageKey: string;
  customConfig?: Partial<SEOConfig>;
}

const SEOHead = ({ pageKey, customConfig }: SEOHeadProps) => {
  const seoTags = generateSEOTags(pageKey, customConfig);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTags.title}</title>
      <meta name="description" content={seoTags.description} />
      {seoTags.keywords && <meta name="keywords" content={seoTags.keywords} />}
      <meta name="author" content="Social Fox" />
      <link rel="canonical" href={seoTags.canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={seoTags.ogTitle} />
      <meta property="og:description" content={seoTags.ogDescription} />
      <meta property="og:type" content={seoTags.ogType} />
      <meta property="og:url" content={seoTags.ogUrl} />
      <meta property="og:image" content={seoTags.ogImage} />
      <meta property="og:site_name" content="Social Fox" />

      {/* Twitter */}
      <meta name="twitter:card" content={seoTags.twitterCard} />
      <meta name="twitter:site" content={seoTags.twitterSite} />
      <meta name="twitter:title" content={seoTags.ogTitle} />
      <meta name="twitter:description" content={seoTags.ogDescription} />
      <meta name="twitter:image" content={seoTags.twitterImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured Data */}
      {seoTags.jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(seoTags.jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
