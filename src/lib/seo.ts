// SEO utility functions and constants

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  jsonLd?: object;
}

// Base SEO configuration
export const baseSEO = {
  siteName: "Social Fox",
  siteUrl: "https://socialfox.dev",
  defaultImage: "/twitter-image.jpeg",
  twitterHandle: "@heynathanielj",
  favicon: "/favicon.ico",
};

// Page-specific SEO configurations
export const seoConfigs: Record<string, SEOConfig> = {
  home: {
    title: "Social Fox – Automatically Turn GitHub Activity into Social Media Posts",
    description: "Transform your GitHub commits, PRs, and releases into engaging Twitter/X and LinkedIn posts. Perfect for indie hackers and developers who want to build in public effortlessly.",
    keywords: [
      "automate GitHub commits to Twitter",
      "post project updates to LinkedIn automatically", 
      "tools for indie hackers to share work",
      "build in public automation",
      "GitHub to social media",
      "developer social media automation",
      "automatic posting for developers",
      "GitHub activity to content",
      "social media for developers",
      "indie hacker tools"
    ],
    ogType: "website",
    twitterCard: "summary_large_image",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Social Fox",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Automatically transform your GitHub activity into engaging social media posts for Twitter/X and LinkedIn",
      "url": "https://socialfox.dev",
      "author": {
        "@type": "Person",
        "name": "Nathaniel James"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "ratingCount": "1"
      }
    }
  },
  auth: {
    title: "Sign In to Social Fox – Automate Your GitHub Social Posts",
    description: "Join Social Fox to automatically turn your GitHub activity into engaging social media content. Sign up for free and get 15 credits to start.",
    keywords: ["sign up social fox", "GitHub social automation", "developer tools signup"],
    ogType: "website"
  },
  dashboard: {
    title: "Dashboard – Social Fox",
    description: "Manage your GitHub to social media automation. View your projects, posts, and settings.",
    keywords: ["social fox dashboard", "GitHub automation dashboard"],
    ogType: "website"
  },
  settings: {
    title: "Settings – Social Fox",
    description: "Configure your Social Fox settings, manage connections, and customize your posting preferences.",
    keywords: ["social fox settings", "automation settings"],
    ogType: "website"
  }
};

// Generate SEO tags
export const generateSEOTags = (pageKey: string, customConfig?: Partial<SEOConfig>) => {
  const config = seoConfigs[pageKey] || seoConfigs.home;
  const mergedConfig = { ...config, ...customConfig };
  
  const fullTitle = mergedConfig.title.includes(baseSEO.siteName) 
    ? mergedConfig.title 
    : `${mergedConfig.title} | ${baseSEO.siteName}`;
    
  const canonical = mergedConfig.canonical || `${baseSEO.siteUrl}${pageKey === 'home' ? '' : `/${pageKey}`}`;
  const ogImage = mergedConfig.ogImage || baseSEO.defaultImage;
  
  return {
    title: fullTitle,
    description: mergedConfig.description,
    keywords: mergedConfig.keywords?.join(', ') || '',
    canonical,
    ogTitle: fullTitle,
    ogDescription: mergedConfig.description,
    ogImage: ogImage.startsWith('http') ? ogImage : `${baseSEO.siteUrl}${ogImage}`,
    ogType: mergedConfig.ogType || 'website',
    ogUrl: canonical,
    twitterCard: mergedConfig.twitterCard || 'summary_large_image',
    twitterSite: baseSEO.twitterHandle,
    twitterImage: ogImage.startsWith('http') ? ogImage : `${baseSEO.siteUrl}${ogImage}`,
    jsonLd: mergedConfig.jsonLd
  };
};

// Keywords for blog content ideas
export const targetKeywords = [
  // Primary keywords
  "automate GitHub commits to Twitter",
  "post project updates to LinkedIn automatically",
  "tools for indie hackers to share work",
  "GitHub to social media automation",
  "build in public automation",
  
  // Secondary keywords
  "developer social media tools",
  "automatic posting for developers", 
  "GitHub activity to content",
  "social media for programmers",
  "indie hacker marketing tools",
  
  // Long-tail keywords
  "how to automate GitHub commits to social media",
  "best tools for developers to post on Twitter",
  "automated LinkedIn posts for developers",
  "building in public tools for indie hackers",
  "social media automation for GitHub projects"
];
