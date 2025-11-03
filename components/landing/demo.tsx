'use client';

const Demo = () => {
  return (
    <section id="demo" className="py-10 bg-white scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">See it in Action.</h2>
        <p className="text-md text-italic text-gray-600 mb-8 max-w-2xl mx-auto">Type a rough thought → AI turns it into a clean, on‑brand post → Tweak fast → Schedule.</p>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 group cursor-pointer">
          <iframe
            src="https://capture.navattic.com/cmhf3v4dc000404ju0l8eab4p"
            style={{ border: 'none', width: '100%', height: '100%' }}
            data-navattic-demo-id="cmhf3v4dc000404ju0l8eab4p"
            allow="fullscreen"
            title="Social Fox Demo"
          />
         
        </div>

        <div className="text-center mt-8">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Schedule my content now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Demo;


