import React from 'react';
import { Twitter, Linkedin } from 'lucide-react';

type ImageCardProps = {
  platform: 'twitter' | 'linkedin';
  src: string;
  alt: string;
};

const ImageCard: React.FC<ImageCardProps> = ({ platform, src, alt }) => {
  const isTwitter = platform === 'twitter';
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        {isTwitter ? (
          <Twitter className="w-4 h-4 text-blue-400" />
        ) : (
          <Linkedin className="w-4 h-4 text-blue-600" />
        )}
        <span className="text-sm font-medium text-gray-700">{isTwitter ? 'Twitter/X' : 'LinkedIn'}</span>
      </div>
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto block"
          loading="lazy"
        />
      </div>
    </div>
  );
};

const Results: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Social Content, Auto-Generated</h2>
          <p className="text-lg text-gray-600">Actual examples produced by Social Fox for Twitter/X and LinkedIn.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ImageCard platform="twitter" src="/results/x-post-1.jpeg" alt="Example Twitter post 1" />
          <ImageCard platform="linkedin" src="/results/linkedin-post-1.jpeg" alt="Example LinkedIn post" />
          <ImageCard platform="twitter" src="/results/x-post-2.jpeg" alt="Example Twitter post 2" />
          <ImageCard platform="twitter" src="/results/x-post-3.jpeg" alt="Example Twitter post 3" />
        </div>
      </div>
    </section>
  );
};

export default Results;


