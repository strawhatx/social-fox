import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

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
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">AI Thread Writer for Twitter (X)</h1>
        <p className="text-gray-700 max-w-3xl mx-auto">
          Turn outlines into scroll‑stopping threads. Structure, expand, and refine each tweet to maximize hooks and retention.
        </p>
        <div className="mt-6">
          <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
            Write your next thread now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { title: 'Hook suggestions', desc: 'Open strong with data‑backed hook styles that get clicks.' },
          { title: 'Structure guidance', desc: 'Keep readers with pacing, transitions, and clear takeaways.' },
          { title: 'Reusable templates', desc: 'Save frameworks that consistently perform for your niche.' }
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
          <li>Paste notes or a rough outline</li>
          <li>Generate a thread with hooks and flow suggestions</li>
          <li>Edit tone and tighten each tweet via conversation</li>
          <li>Schedule and measure performance</li>
        </ol>
      </section>

      {/* Social proof */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Creators growing with better threads</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            '“My thread CTAs now get replies.”',
            '“The hook suggestions are gold.”',
            '“Finally a system for consistent threads.”'
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
            <h3 className="font-semibold">Will my threads sound robotic?</h3>
            <p className="text-sm text-gray-700">No — you control the tone and edit via conversation to keep it authentic.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I reuse thread frameworks?</h3>
            <p className="text-sm text-gray-700">Yes — save templates and snippets to scale your process.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Link href="/sign-up" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold">
          Start your next thread
        </Link>
      </section>
      <Script id="breadcrumbs-thread-writer" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socialfox.dev/' },
          { '@type': 'ListItem', position: 2, name: 'AI Thread Writer', item: 'https://socialfox.dev/ai-thread-writer' }
        ]
      }) }} />
      <Script id="faq-thread-writer" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
          { '@type': 'Question', name: 'Can AI help me write better threads?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — Social Fox expands your ideas into clear, engaging multi-tweet threads and suggests hooks and structure.' }},
          { '@type': 'Question', name: 'How do I never run out of tweet ideas?', acceptedAnswer: { '@type': 'Answer', text: 'Use Social Fox idea prompts and templates to keep a steady pipeline of engaging content.' }}
        ]
      }) }} />
    </main>
  );
}


