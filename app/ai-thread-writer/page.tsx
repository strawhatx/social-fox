import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Thread Writer for Twitter (X) – Social Fox',
  description: 'An AI thread writer that turns your ideas into clear, engaging multi-tweet threads. Never run out of tweet ideas again.',
  alternates: { canonical: '/ai-thread-writer' },
  openGraph: {
    title: 'AI Thread Writer for Twitter (X) – Social Fox',
    description: 'Expand ideas into engaging Twitter threads — fast and on-brand.',
    url: 'https://socialfox.dev/ai-thread-writer',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox – AI Thread Writer' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Thread Writer for Twitter (X) – Social Fox',
    description: 'Expand ideas into engaging Twitter threads — fast and on-brand.',
    images: ['/twitter-image.jpeg']
  }
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">AI Thread Writer for Twitter (X)</h1>
      <p className="text-gray-700 mb-6">
        Turn outlines into scroll-stopping threads. Social Fox helps you structure, expand, and refine each tweet to drive hooks, retention, and clarity.
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-800">
        <li>Hook suggestions and structure guidance</li>
        <li>On-brand tone and voice with conversation edits</li>
        <li>Reusable thread templates and snippets</li>
        <li>Scheduling for optimal reach</li>
      </ul>
      <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
        Write your next thread now
      </Link>
    </main>
  );
}


