

import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import UpgradeModalProvider from '@/components/subscription/upgrade-modal-provider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://socialfox.dev'),
  title: {
    default: 'Social Fox — The Simplest Content Planner for Creators',
    template: '%s | Social Fox'
  },
  description: 'Plan, create, and schedule social content in minutes. Social Fox helps creators stay consistent with an easy calendar and AI post ideas.',
  keywords: [
    'content planner',
    'social media calendar',
    'schedule social posts',
    'ai post ideas',
    'creator tools',
    'content scheduling',
    'content planning for creators',
    'plan create schedule content'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: 'https://socialfox.dev/',
    siteName: 'Social Fox',
    title: 'Social Fox: Plan, Create & Schedule Your Content Effortlessly',
    description: 'Turn your ideas into posts that ship. Social Fox gives you a simple calendar, AI content generator, and smart analytics — all in one workspace.',
    images: [
      {
        url: '/twitter-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Social Fox — Content Planner for Creators'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@heynathanielj',
    creator: '@heynathanielj',
    title: 'Social Fox: Plan, Create & Schedule Your Content Effortlessly',
    description: 'Turn your ideas into posts that ship. Social Fox gives you a simple calendar, AI content generator, and smart analytics — all in one workspace.',
    images: ['/twitter-image.jpeg']
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <ClerkProvider>
      <html lang="en">

        <body className={inter.className}>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-NML6R8WYKV"
            strategy="afterInteractive"
          />
          <Script id="ga-gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NML6R8WYKV');
            `}
          </Script>
          <UpgradeModalProvider>
            {children}
          </UpgradeModalProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}