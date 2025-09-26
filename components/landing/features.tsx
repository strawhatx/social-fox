'use client';

import { Bot, Settings, Clock, CheckCircle, Twitter, Linkedin } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Twitter className="w-6 h-6 text-blue-400" />,
      title: "Built for X",
      description: "Platform‑aware formatting, hashtags, and structure for higher engagement where you share."
    },
    {
      icon: <Settings className="w-8 h-8 text-orange-500" />,
      title: "Conversation‑based editing",
      description: "Guide the AI with natural prompts. Tweak tone, length, and structure without starting from scratch."
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Scheduling built‑in",
      description: "Queue content to post when you want, or save drafts for later — you stay in control."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      title: "Templates librabry",
      description: "Start fast with templates to get started."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            More Than Just Drafts.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Template Library, Scheduler, and quick sharing with your team—stay consistent without context switching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500 to red-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <a href="/sign-up" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-white/10 hover:bg-white/20 font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
            Explore Templates Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;