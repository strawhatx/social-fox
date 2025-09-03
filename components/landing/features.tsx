'use client';

import { Bot, Settings, Clock, CheckCircle, Twitter, Linkedin } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-orange-500" />,
      title: "Auto-generates platform-specific posts",
      description: "Smart AI analyzes your commits, PRs, and releases to create engaging posts tailored for each platform."
    },
    {
      icon: <div className="flex space-x-1">
        <Twitter className="w-6 h-6 text-blue-400" />
        <Linkedin className="w-6 h-6 text-blue-600" />
      </div>,
      title: "Optimized for Twitter/X and LinkedIn",
      description: "Each post is crafted with platform-specific best practices, hashtags, and formatting for maximum engagement."
    },
    {
      icon: <Settings className="w-8 h-8 text-orange-500" />,
      title: "Customizable tone and format",
      description: "Choose your voice — professional, casual, or technical. Customize templates to match your personal brand."
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Post on your schedule",
      description: "Get ready-to-post content generated from your commits. Post immediately or save for later — you control when and what goes live."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      title: "One-click approval workflow",
      description: "Review and approve posts before they go live. Make quick edits or post instantly with confidence."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Build in public, effortlessly
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Focus on building great products while Social Fox keeps your audience engaged with your progress.
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

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Perfect for indie hackers and busy founders
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Stop choosing between building your product and building your audience. 
            With Social Fox, your code commits become ready-to-share content that you can post whenever you want.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <span className="bg-white/20 px-4 py-2 rounded-full">SaaS Developers</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Solo Founders</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Open Source Maintainers</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">Technical Writers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;