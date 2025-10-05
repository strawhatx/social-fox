"use client";

import Hero from '@/components/landing/hero';
import Results from '@/components/landing/results';
import Features from '@/components/landing/features';
import Pricing from '@/components/landing/pricing';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <Results />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}