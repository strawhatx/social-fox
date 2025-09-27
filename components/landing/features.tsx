'use client';

import { Bot, Settings, Clock, CheckCircle, Linkedin } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <span className="text-2xl text-blue-400">𝕏</span>,
      title: "Built for 𝕏",
      description: "Platform‑aware formatting, hashtags, and structure for higher engagement where you share."
    },
    {
      icon: <span className="text-2xl text-blue-400">💬</span>,
      title: "Conversation‑based editing",
      description: "Guide the AI with natural prompts. Tweak tone, length, and structure without starting from scratch."
    },
    {
      icon: <span className="text-2xl text-orange-500">⏰</span>,
      title: "Scheduling built‑in",
      description: "Queue content to post when you want, or save drafts for later — you stay in control."
    },
    {
      icon: <span className="text-2xl text-orange-500">📝</span>,
      title: "Templates library",
      description: "Start fast with ready-made templates to get going immediately."
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
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