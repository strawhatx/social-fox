import type { Metadata } from 'next';
import Script from 'next/script';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Pricing from '@/components/landing/pricing';
import Footer from '@/components/landing/footer';
import Demo from '@/components/landing/demo';

export const metadata: Metadata = {
  title: 'Social Fox — Automate Twitter Content & Grow Engagement',
  description: 'Transform your tweets into high‑engagement threads. Plan, automate, and track performance with Social Fox.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://socialfox.dev/',
    title: 'Social Fox — Automate Twitter Content & Grow Engagement',
    description: 'Transform your tweets into high‑engagement threads. Plan, automate, and track performance with Social Fox.',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox — Content Planner for X' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Fox — Automate Twitter Content & Grow Engagement',
    description: 'Transform your tweets into high‑engagement threads. Plan, automate, and track performance with Social Fox.',
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
                name: 'Is there a ChatGPT for Twitter (X)?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes — Social Fox is an AI copilot for tweets and threads, helping you write better posts faster.'
                }
              },
              {
                '@type': 'Question',
                name: 'How can an AI copilot help with Twitter?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'It brainstorms ideas, drafts posts, refines tone, expands into threads, and helps schedule for peak reach.'
                }
              }
            ]
          })
        }}
      />
    </main>
  );
}