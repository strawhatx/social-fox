import CTA from '@/features/landing/CTA';
import Hero from '@/features/landing/Hero';
import Features from '@/features/landing/Features';
import Pricing from '@/features/landing/Pricing';
import Testimonials from '@/features/landing/Testimonials';
import Footer from '@/features/landing/Footer';
import Results from '@/features/landing/Results';
import PainPoint from '@/features/landing/PainPoint';
import FAQ from '@/features/landing/FAQ';
import SEOHead from '@/components/SEOHead';
import MicroSurvey from '@/features/landing/MicroSurvey';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead pageKey="home" />
      <Hero />
      <Results />
      <PainPoint />
      <Features />
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

export default LandingPage;