import type { Metadata } from 'next';
import Script from 'next/script';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Pricing from '@/components/landing/pricing';
import Footer from '@/components/landing/footer';
import Demo from '@/components/landing/demo';

export const metadata: Metadata = {
  title: 'Social Fox — The Simplest Content Planner for Creators',
  description: 'Plan, create, and schedule social content in minutes. Social Fox helps creators stay consistent with an easy calendar and AI post ideas.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://socialfox.dev/',
    title: 'Social Fox: Plan, Create & Schedule Your Content Effortlessly',
    description: 'Turn your ideas into posts that ship. Social Fox gives you a simple calendar, AI content generator, and smart analytics — all in one workspace.',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox — Content Planner for Creators' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Fox: Plan, Create & Schedule Your Content Effortlessly',
    description: 'Turn your ideas into posts that ship. Social Fox gives you a simple calendar, AI content generator, and smart analytics — all in one workspace.',
    images: ['/twitter-image.jpeg']
  }
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Demo />
      <Features />
      <Pricing />
      <Footer />
      <Script
        id="ld-org"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Social Fox',
            url: 'https://socialfox.dev/',
            logo: 'https://socialfox.dev/fox-logo.png',
            sameAs: [
              'https://x.com/heynathanielj',
            ]
          })
        }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Social Fox',
            url: 'https://socialfox.dev/'
          })
        }}
      />
      <Script
        id="ld-faq-home"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is Social Fox?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Social Fox is the simplest content planner for creators — plan, create, and schedule social content in minutes with an easy calendar, AI post ideas, and smart analytics.'
                }
              },
              {
                '@type': 'Question',
                name: 'How does Social Fox help creators stay consistent?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'It gives you an easy content calendar to plan your schedule, AI to generate post ideas, and analytics to learn what works — so your posts ship on time.'
                }
              }
            ]
          })
        }}
      />
    </main>
  );
}