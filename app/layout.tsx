

import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import UpgradeModalProvider from '@/components/subscription/upgrade-modal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://socialfox.dev'),
  title: {
    default: 'Social Fox – AI Copilot for Twitter (X) Posts',
    template: '%s | Social Fox'
  },
  description: 'Social Fox is your AI co‑pilot for Twitter (X). Like ChatGPT for tweets, it helps founders & creators write better posts and threads—faster.',
  keywords: [
    'chatgpt for twitter posts',
    'ai copilot for writing tweets',
    'ai tweet generator for x',
    'chatgpt alternative for twitter',
    'how to use ai to write better tweets',
    'best ai tool for startup founders twitter',
    'ai assistant for creators posting on x',
    'social media copilot for solopreneurs',
    'ai thread writer for indie hackers',
    'ai twitter helper for content creators',
    'stuck on what to tweet ai help',
    'never run out of tweet ideas with ai',
    'ai tool to write engaging tweets fast',
    'how to stop blank page anxiety twitter'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: 'https://socialfox.dev/',
    siteName: 'Social Fox',
    title: 'Social Fox – AI Copilot for Twitter (X) Posts',
    description: 'Like ChatGPT for tweets: write better posts & threads faster with Social Fox.',
    images: [
      {
        url: '/twitter-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Social Fox – AI Copilot for Twitter (X)'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@heynathanielj',
    creator: '@heynathanielj',
    title: 'Social Fox – AI Copilot for Twitter (X) Posts',
    description: 'Like ChatGPT for tweets: write better posts & threads faster with Social Fox.',
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
          <UpgradeModalProvider>
            {children}
          </UpgradeModalProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}