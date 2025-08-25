import CTA from '@/components/landing/CTA';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';
import Demo from '@/components/landing/Demo';
import Results from '@/components/landing/Results';
import PainPoint from '@/components/landing/PainPoint';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Results />
      <PainPoint />
      <Features />
      <Demo />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;