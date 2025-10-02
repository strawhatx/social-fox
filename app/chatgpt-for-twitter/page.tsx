import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ChatGPT for Twitter (X) – Write Better Tweets Faster',
  description: 'Looking for ChatGPT for Twitter? Social Fox is your AI copilot for tweets and threads — write better posts faster, in your voice.',
  alternates: { canonical: '/chatgpt-for-twitter' },
  openGraph: {
    title: 'ChatGPT for Twitter (X) – Social Fox',
    description: 'Your AI copilot for tweets and threads. Write better posts faster, in your voice.',
    url: 'https://socialfox.dev/chatgpt-for-twitter',
    images: [{ url: '/twitter-image.jpeg', width: 1200, height: 630, alt: 'Social Fox – ChatGPT for Twitter' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatGPT for Twitter (X) – Social Fox',
    description: 'Your AI copilot for tweets and threads. Write better posts faster, in your voice.',
    images: ['/twitter-image.jpeg']
  }
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">ChatGPT for Twitter (X)</h1>
      <p className="text-gray-700 mb-6">
        Social Fox is like ChatGPT for tweets — an AI copilot that helps founders and creators turn rough ideas into engaging tweets and threads, faster.
      </p>
      <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-800">
        <li>Generate tweet ideas and outlines so you never run out of content</li>
        <li>Expand thoughts into on-brand threads with structure and flow</li>
        <li>Edit via conversation to keep your authentic voice</li>
        <li>Schedule posts at ideal times in one click</li>
      </ul>
      <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
        Start writing better tweets
      </Link>
    </main>
  );
}


