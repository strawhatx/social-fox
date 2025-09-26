import React from 'react';
import { Bot, Settings, Clock, CheckCircle, Twitter, Linkedin } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <div className="text-4xl">📝</div>,
      title: "Template Library",
      description: "Pre-built templates for founder intros, product launches, feature drops, motivational posts, and more.",
      demo: "50+ battle-tested templates"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Smart Scheduler",
      description: "Queue posts for optimal times. Set it and forget it — your content goes live when your audience is most active.",
      demo: "Schedule weeks in advance"
    },
    {
      icon: <div className="flex space-x-1">
        <Twitter className="w-6 h-6 text-blue-400" />
        <Linkedin className="w-6 h-6 text-blue-600" />
      </div>,
      title: "Cross-Platform Ready", 
      description: "One input, multiple optimized posts. Each platform gets content tailored to its unique style and audience.",
      demo: "Twitter + LinkedIn + more"
    },
    {
      icon: <div className="text-4xl">👥</div>,
      title: "Team Collaboration",
      description: "Share drafts with your team or community for feedback before posting. Build better content together.",
      demo: "Get feedback before posting"
    },
    {
      icon: <Bot className="w-8 h-8 text-orange-500" />,
      title: "AI Brand Voice",
      description: "Train the AI on your writing style. Every generated post sounds authentically like you, not generic AI copy.",
      demo: "Learns your unique voice"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-orange-500" />,
      title: "Performance Analytics",
      description: "Track what works. See which posts drive engagement and refine your strategy with real data.",
      demo: "Boost engagement by 200%+"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            More Than Just Drafts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, schedule, and share authentic content that builds your audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="bg-orange-100 text-orange-700 text-sm font-medium px-3 py-1 rounded-full inline-block">
                {feature.demo}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to explore templates?
          </h3>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Join hundreds of founders who've transformed their content strategy. Start with proven templates or let AI learn your unique voice.
          </p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200">
            Explore Templates Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;