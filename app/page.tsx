import Hero from '@/components/landing/hero';
import Results from '@/components/landing/results';
import Demo from '@/components/landing/demo';
import Features from '@/components/landing/features';
import Pricing from '@/components/landing/pricing';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Results />
      <Demo />
      <Features />
      <Pricing />

      <Footer />
    </main>
  );
}