import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Netlify will handle the form submission automatically
    // We just need to show success state
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

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

        <form 
          onSubmit={handleSubmit} 
          className="max-w-md mx-auto"
          name="beta-signup"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
        >
          {/* Hidden field for Netlify */}
          <input type="hidden" name="form-name" value="beta-signup" />
          {/* Honeypot field for spam protection */}
          <input type="hidden" name="bot-field" />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitted || isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none disabled:hover:scale-100"
            >
              <span>
                {isSubmitting ? 'Joining...' : isSubmitted ? 'Joined!' : 'Join the Beta'}
              </span>
              {!isSubmitted && !isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {isSubmitted && (
          <div className="mt-6 p-4 bg-green-600 bg-opacity-20 border border-green-500 rounded-xl">
            <p className="text-green-300 font-medium">
              🎉 Thanks for joining the beta! We'll be in touch soon with early access.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-400 mt-6">
          Be one of the first to try Social Fox. No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default CTA;