import CTA from '@/components/landing/CTA';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;