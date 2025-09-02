import React from 'react';
import { Clock, FileText, Zap } from 'lucide-react';

const PainPoint: React.FC = () => {
  const painPoints = [
    {
      icon: Clock,
      title: "Tired of writing posts after every commit?",
      description: "Spending precious dev time crafting social updates instead of coding"
    },
    {
      icon: FileText,
      title: "Struggling to summarize your updates?",
      description: "Turning technical work into engaging social content is hard"
    },
    {
      icon: Zap,
      title: "Missing opportunities to build in public?",
      description: "Your amazing work stays hidden while others get the attention"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Stop letting great work go unnoticed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Social Fox automatically turns your GitHub activity into engaging posts, so you can focus on what you do best — building.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => {
            const IconComponent = point.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
                  <IconComponent className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PainPoint;