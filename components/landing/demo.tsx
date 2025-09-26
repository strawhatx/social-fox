'use client';
import Link from 'next/link';

const Demo = () => {
  return (
    <section id="demo" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">See it in Action.</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Type a rough thought → AI turns it into a clean, on‑brand post → Tweak fast → Schedule.</p>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 group cursor-pointer">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/QyJgtkmr9yg"
            title="Social Fox Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/sign-up" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 font-semibold hover:shadow-lg transform hover:scale-105 transition-all">
            Start Your Free Beta
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Demo;


