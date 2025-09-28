import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import UpgradeModalProvider from '@/components/subscription/upgrade-modal-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatOwl - Support that never sleeps',
  description: 'AI-powered helpdesk widget for your website',
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