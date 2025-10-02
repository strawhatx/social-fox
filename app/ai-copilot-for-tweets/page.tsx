import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

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
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">AI Copilot for Tweets</h1>
        <p className="text-gray-700 max-w-3xl mx-auto">
          Stop staring at a blank composer. Brainstorm, draft, and polish tweets and threads that sound like you — and perform.
        </p>
        <div className="mt-6">
          <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
            Try the AI copilot for tweets
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { title: 'Idea → Post flow', desc: 'Go from raw notes to publish‑ready tweets with guided prompts.' },
          { title: 'On‑brand tone', desc: 'Conversational edits keep your authentic voice while improving clarity.' },
          { title: 'Templates & snippets', desc: 'Kickstart threads with reusable structures that convert.' }
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
          <li>Capture a thought or paste a draft</li>
          <li>Refine with AI prompts and tone controls</li>
          <li>Turn into a thread using templates</li>
          <li>Schedule for optimal times</li>
        </ol>
      </section>

      {/* Social proof */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Why creators choose Social Fox</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            '“Helps me ship daily without sounding robotic.”',
            '“My threads are clearer and get more saves.”',
            '“All‑in‑one drafting and scheduling.”'
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
            <h3 className="font-semibold">Will it make my tweets sound generic?</h3>
            <p className="text-sm text-gray-700">No — you guide the edits via conversation, so the final post retains your voice.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I reuse winning structures?</h3>
            <p className="text-sm text-gray-700">Yes — save templates and snippets for repeatable performance.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
          Start your next post
        </Link>
      </section>
      <Script id="breadcrumbs-ai-copilot" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socialfox.dev/' },
          { '@type': 'ListItem', position: 2, name: 'AI Copilot for Tweets', item: 'https://socialfox.dev/ai-copilot-for-tweets' }
        ]
      }) }} />
      <Script id="faq-ai-copilot" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'What\'s the best AI tool for startup founders on Twitter?', acceptedAnswer: { '@type': 'Answer', text: 'Social Fox helps founders ship content consistently with idea prompts, thread templates, and scheduling.' }},
          { '@type': 'Question', name: 'Can an AI copilot help creators post on X?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Social Fox assists creators with brainstorming, drafting, and optimizing tweets and threads.' }}
        ]
      }) }} />
    </main>
  );
}


