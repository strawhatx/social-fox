import CTA from '@/components/landing/CTA';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

import Results from '@/components/landing/Results';
import Demo from '@/components/landing/Demo';
import FAQ from '@/components/landing/FAQ';
import SEOHead from '@/components/SEOHead';
import MicroSurvey from '@/components/landing/MicroSurvey';
import InteractiveDemo from '@/components/landing/InteractiveDemo';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="home" />
      <Hero />
      <Results />
      <Demo />
      <Features />
      <InteractiveDemo />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <MicroSurvey 
        formId="3jjyKY" 
        autoOpenOnExit={true}
        buttonText="Why didn't you sign up?"
        showOnceKey="exit_survey_shown"
      />
    </div>
  );
};

export default Landing;