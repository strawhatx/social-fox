import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {

  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6">
            <span className="text-2xl">🦊</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to let your code do the talking?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join the beta and start turning your GitHub activity into ready-to-share social media content. 
            No more writer's block, no more missed opportunities to build in public.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              state={{ openTab: 'signup', returnTo: '/dashboard' }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Join the Beta</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-6 text-center">
            Be one of the first to try Social Fox. No spam, unsubscribe anytime.
          </p>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Be one of the first to try Social Fox. No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default CTA;