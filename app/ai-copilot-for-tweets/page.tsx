import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Copilot for Writing Tweets – Social Fox',
  description: 'An AI copilot for writing tweets and threads. Social Fox helps founders and creators write better posts, faster.',
  alternates: { canonical: '/ai-copilot-for-tweets' },
  openGraph: {
    title: 'AI Copilot for Writing Tweets – Social Fox',
    description: 'Write better tweets and threads — faster, in your voice.',
    url: 'https://socialfox.dev/ai-copilot-for-tweets',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox – AI Copilot for Tweets' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Copilot for Writing Tweets – Social Fox',
    description: 'Write better tweets and threads — faster, in your voice.',
    images: ['/twitter-image.jpeg']
  }
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">AI Copilot for Tweets</h1>
      <p className="text-gray-700 mb-6">
        Stop staring at a blank composer. Social Fox helps you brainstorm, draft, and polish tweets that sound like you — and perform.
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-800">
        <li>Idea-to-post flow that removes friction</li>
        <li>On-brand tone control with conversational editing</li>
        <li>Smart thread expansion and templates</li>
        <li>Built-in scheduling and library</li>
      </ul>
      <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
        Try the AI copilot for tweets
      </Link>
    </main>
  );
}


