'use client';

import React from 'react';
import { MessageCircle, Users, Heart } from 'lucide-react';

const Testimonials = () => {

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built by builders, for builders
          </h2>
          <p className="text-xl text-gray-600">
            We're scratching our own itch — and we think you'll love it too.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              "Built to scratch our own itch — now we're opening it up to others who struggle to keep up with posting their progress. No fluff, just what we wish existed."
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">🙌</span>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              "We're in beta — looking for 10 users to try it and give brutally honest feedback."
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Made with love by indie hackers who get it</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;