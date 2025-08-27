import React from 'react';
import { Github, Linkedin, Zap, User, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import MicroSurvey from '@/components/landing/MicroSurvey';

const Hero: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-orange-50 py-5 overflow-hidden">
      <div className="absolute inset-0 bg-white/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <a 
              href="https://www.producthunt.com/products/socialfox-build-in-public-effortlessly?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-socialfox&#0045;build&#0045;in&#0045;public&#0045;effortlessly" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1009418&theme=light&t=1756165331728" 
                alt="Socialfox — Build in public effortlessly - Turn your GitHub commits into content for X and LinkedIn. | Product Hunt" 
                className="w-[200px] h-[40px]"
                width="200" 
                height="30" 
              />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://twitter.com/heynathanielj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter: @heynathanielj"
              >
                <Twitter className="w-4 h-4 text-brand-orange fill-orange-500" />
              </a>
            </Button>
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button variant="outline" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user ? "Dashboard" : "Get Started"}</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="text-center">
          <div className="flex justify-center items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3">
                <img src="/fox-logo.png" alt="Fox Logo" className="w-10 h-10" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
            <span className="block">Social</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Fox
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto font-medium">
            Turn your GitHub activity into ready-to-post content for X and LinkedIn.
          </p>
          
          <p className="text-lg text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            Social Fox turns your GitHub activity into engaging, ready-to-post content for Twitter/X and LinkedIn — so indie hackers and busy founders can stay active on their own schedule.
          </p>
          
          <div className="flex justify-center items-center space-x-8 mb-12">
            <div className="flex items-center space-x-2 text-gray-600">
              <Github className="w-6 h-6" />
              <span className="text-sm font-medium">GitHub Activity</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-blue-400"></div>
              <Zap className="w-5 h-5 text-orange-500 mx-2" />
              <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-blue-400"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Twitter className="w-6 h-6 text-brand-orange" />
                <span className="text-sm font-medium">Twitter/X</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Linkedin className="w-6 h-6" />
                <span className="text-sm font-medium">LinkedIn</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/auth"
              state={{ openTab: 'signup', returnTo: '/dashboard' }}
            >
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Generate my first post
              </button>
            </Link>
            <a href="#examples" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-orange-400 hover:text-orange-600 transition-all duration-200">See examples</a>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 font-medium">
              ✨ Free Beta • No Credit Card Required • 15 Free Credits to Start
            </p>
          </div>
          
          <div className="mt-8 flex justify-center space-x-6 text-sm">
            <a href="#features" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
              Pricing
            </a>
            <a href="#faq" className="text-gray-600 hover:text-orange-500 transition-colors duration-200">
              FAQ
            </a>
            <MicroSurvey formId={import.meta.env.VITE_TALLY_FORM_ID as string | undefined} buttonText="Why didn't you sign up?" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;