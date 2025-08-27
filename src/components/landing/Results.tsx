import React from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ImageCardProps = {
  platform: 'twitter' | 'linkedin';
  src: string;
  alt: string;
};

const ImageCard: React.FC<ImageCardProps> = ({ platform, src, alt }) => {
  const isTwitter = platform === 'twitter';
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100/70 bg-gradient-to-r from-gray-50 to-white">
        <div className={`p-2 rounded-full ${isTwitter ? 'bg-blue-50' : 'bg-blue-50'}`}>
          {isTwitter ? (
            <Twitter className="w-4 h-4 text-blue-500" />
          ) : (
            <Linkedin className="w-4 h-4 text-blue-600" />
          )}
        </div>
        <span className="text-sm font-semibold text-gray-800">{isTwitter ? 'Twitter/X' : 'LinkedIn'}</span>
      </div>
      <div className="relative p-2">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto block rounded-2xl group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
      </div>
    </div>
  );
};

const Results: React.FC = () => {
  const posts = [
    { platform: "twitter" as const, src: "/results/x-post-1.jpeg", alt: "Example Twitter post 1" },
    { platform: "linkedin" as const, src: "/results/linkedin-post-1.jpeg", alt: "Example LinkedIn post" },
    { platform: "twitter" as const, src: "/results/x-post-2.jpeg", alt: "Example Twitter post 2" },
    { platform: "twitter" as const, src: "/results/x-post-3.jpeg", alt: "Example Twitter post 3" },
  ];

  return (
    <section id="examples" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Social Content, Auto-Generated</h2>
          <p className="text-lg text-gray-600">Actual examples produced by Social Fox for Twitter/X and LinkedIn.</p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {posts.map((post, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <ImageCard platform={post.platform} src={post.src} alt={post.alt} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default Results;


