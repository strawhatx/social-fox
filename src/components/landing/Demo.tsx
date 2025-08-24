import React from 'react';

const Demo: React.FC = () => {
  return (
    <section id="demo" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">See How It Works</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Watch a quick walkthrough of Social Fox turning GitHub activity into ready-to-post content.
        </p>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/QyJgtkmr9yg"
            title="Social Fox Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
};

export default Demo;


