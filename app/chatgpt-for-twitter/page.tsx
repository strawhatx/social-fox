import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

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
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">ChatGPT for Twitter (X)</h1>
        <p className="text-gray-700 max-w-3xl mx-auto">
          Social Fox is your AI copilot for tweets and threads — ideate, draft, and polish posts that sound like you, in minutes.
        </p>
        <div className="mt-6">
          <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
            Start writing better tweets
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { title: 'Never run out of ideas', desc: 'Brainstorm hooks, topics, and outlines tailored to your audience.' },
          { title: 'Write threads faster', desc: 'Expand bullet points into structured, engaging multi-tweet threads.' },
          { title: 'Sound like you', desc: 'Conversation editing preserves your voice while improving clarity.' }
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-xl border bg-white">
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-700">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How it works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-800">
          <li>Drop rough ideas or bullet points</li>
          <li>Get tweet options and thread outlines instantly</li>
          <li>Edit tone/length via conversation until it clicks</li>
          <li>Schedule for peak times and track results</li>
        </ol>
      </section>

      {/* Social proof */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Loved by founders & creators</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            '“I shipped 3x more threads last month.”',
            '“Finally stopped blank‑page anxiety.”',
            '“Feels like ChatGPT but tuned for X.”'
          ].map((q, i) => (
            <div key={i} className="p-6 rounded-xl border bg-white text-sm text-gray-700">{q}</div>
          ))}
        </div>
      </section>

      {/* FAQs (visible) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">FAQs</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Is there a ChatGPT for Twitter?</h3>
            <p className="text-sm text-gray-700">Yes — Social Fox acts like ChatGPT for tweets, focused on writing for X.</p>
          </div>
          <div>
            <h3 className="font-semibold">Will it keep my voice?</h3>
            <p className="text-sm text-gray-700">Conversation editing lets you nudge tone, style, and structure without losing authenticity.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
          Try Social Fox free
        </Link>
      </section>
      <Script id="breadcrumbs-chatgpt-twitter" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socialfox.dev/' },
          { '@type': 'ListItem', position: 2, name: 'ChatGPT for Twitter', item: 'https://socialfox.dev/chatgpt-for-twitter' }
        ]
      }) }} />
      <Script id="faq-chatgpt-twitter" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'Is there a ChatGPT for Twitter?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Social Fox functions like ChatGPT for tweets, helping you ideate and write better posts faster.' }},
          { '@type': 'Question', name: 'How do I use AI to write better tweets?', acceptedAnswer: { '@type': 'Answer', text: 'Use Social Fox to brainstorm ideas, expand into threads, and edit tone via conversation so tweets sound like you.' }}
        ]
      }) }} />
    </main>
  );
}


