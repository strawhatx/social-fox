import type { Metadata } from 'next';
import Script from 'next/script';
import Hero from '@/components/landing/hero';
import Results from '@/components/landing/results';
import Features from '@/components/landing/features';
import Pricing from '@/components/landing/pricing';
import Footer from '@/components/landing/footer';

export const metadata: Metadata = {
  title: 'Social Fox – AI Copilot for Twitter (X) Posts',
  description:
    'Social Fox is your AI co‑pilot for Twitter (X). Like ChatGPT for tweets, it helps founders & creators write better posts and threads—faster.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://socialfox.dev/',
    title: 'Social Fox – AI Copilot for Twitter (X) Posts',
    description:
      'Like ChatGPT for tweets: write better posts & threads faster with Social Fox.',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox – AI Copilot for Twitter (X)' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Fox – AI Copilot for Twitter (X) Posts',
    description:
      'Like ChatGPT for tweets: write better posts & threads faster with Social Fox.',
    images: ['/twitter-image.jpeg']
  }
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Results />
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