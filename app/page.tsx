import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Testimonials from '@/components/landing/testimonials';
import Pricing from '@/components/landing/pricing';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}