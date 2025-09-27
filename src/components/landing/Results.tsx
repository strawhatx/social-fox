import React from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-100 rounded-3xl overflow-hidden group">
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
          className="w-full h-auto block rounded-2xl"
          loading="lazy"
        />
      </div>
    </div>
  );
};

const Results: React.FC = () => {
  const posts = [
    {
      platform: 'twitter' as const,
      before: 'Fixed bug in user auth system',
      after: 'Just squashed a tricky authentication bug! 🐛✨ Sometimes the smallest fixes make the biggest difference in user experience. Building in public means sharing both the wins AND the debugging marathons 😅 #TechLife #BugHunting',
      metrics: { likes: '89 (+220%)', retweets: '23 (+180%)', replies: '12 (+300%)' }
    },
    {
      platform: 'linkedin' as const,
      before: 'Released version 2.1 with new dashboard',
      after: 'Excited to announce v2.1 is live! 🚀 Our new analytics dashboard gives users 3x faster insights. This release represents 6 weeks of user feedback integration - proof that listening to your community pays off. What feature should we build next?',
      metrics: { likes: '156 (+190%)', comments: '34 (+250%)', shares: '18 (+200%)' }
    },
    {
      platform: 'twitter' as const,
      before: 'Added dark mode support',
      after: 'Dark mode is finally here! 🌙 After 847 requests (yes, we counted), your eyes can now rest easy. Fun fact: implementing this taught me more about CSS variables than 3 years of development. #DarkMode #DeveloperLife',
      metrics: { likes: '203 (+260%)', retweets: '67 (+310%)', replies: '45 (+280%)' }
    },
    {
      platform: 'twitter' as const,
      before: 'Updated API documentation',
      after: 'Just refreshed our API docs with better examples and clearer explanations 📚 Because good docs = happy developers = better products. If you\'ve been waiting to integrate, now\'s the time! Link in bio 👆',
      metrics: { likes: '78 (+170%)', retweets: '19 (+150%)', replies: '8 (+200%)' }
    },
    {
      platform: 'linkedin' as const,
      before: 'Launched new pricing tiers',
      after: 'Big news! We\'ve restructured our pricing to be more founder-friendly 💰 After talking to 200+ users, we learned affordability was a barrier. Sometimes growing means making less per user but helping more people succeed. Win-win! 🚀',
      metrics: { likes: '267 (+210%)', comments: '45 (+320%)', shares: '29 (+180%)' }
    },
    {
      platform: 'twitter' as const,
      before: 'Improved page load speed by 40%',
      after: 'Speed matters! ⚡ Cut our page load time by 40% through aggressive caching and image optimization. Users don\'t wait for slow sites - and neither should yours. Here\'s what we learned about performance... 🧵',
      metrics: { likes: '134 (+240%)', retweets: '41 (+200%)', replies: '28 (+190%)' }
    },
    {
      platform: 'linkedin' as const,
      before: 'Hired our first designer',
      after: 'Team update! 👋 Just welcomed our first full-time designer to the team. Going from \"developer design\" to actual design thinking has been humbling. Shoutout to everyone who gave us honest (brutal) UI feedback over the past year!',
      metrics: { likes: '189 (+280%)', comments: '52 (+340%)', shares: '31 (+160%)' }
    },
    {
      platform: 'twitter' as const,
      before: 'Reached 1000 users milestone',
      after: '1,000 users! 🎉 One year ago this was just a wild idea in a Notion doc. Today it\'s helping founders build in public without the content creation stress. Each user teaches us something new. Here\'s to the next 1,000! 🚀',
      metrics: { likes: '312 (+290%)', retweets: '89 (+270%)', replies: '67 (+310%)' }
    },
    {
      platform: 'linkedin' as const,
      before: 'Integrated with Slack for notifications',
      after: 'New integration drop! 📢 Social Fox now sends post suggestions straight to your Slack. Because the best ideas often come when you\'re not actively trying to create content. Sometimes automation should feel invisible.',
      metrics: { likes: '98 (+160%)', comments: '23 (+200%)', shares: '15 (+180%)' }
    },
    {
      platform: 'twitter' as const,
      before: 'Fixed mobile responsive issues',
      after: 'Mobile-first finally means mobile-first! 📱 Spent the weekend fixing responsive issues that were driving me crazy. 67% of our traffic is mobile - why did it take me this long to prioritize this? Better late than never! 😅',
      metrics: { likes: '156 (+205%)', retweets: '34 (+170%)', replies: '19 (+220%)' }
    }
  ];

  return (
    <section id="examples" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See the Difference
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Before vs After: Transform bland updates into engaging posts that actually get noticed.
          </p>
        </div>

        <div className="relative">
          <Carousel className="w-full max-w-6xl mx-auto cursor-grab active:cursor-grabbing" opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-6">
              {posts.map((post, index) => (
                <CarouselItem key={index} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 select-none">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      {post.platform === 'twitter' ? (
                        <Twitter className="w-6 h-6 text-blue-400" />
                      ) : (
                        <Linkedin className="w-6 h-6 text-blue-600" />
                      )}
                      <span className="font-semibold capitalize">{post.platform}</span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">BEFORE:</div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-gray-700">
                        {post.before}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">AFTER:</div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                        {post.after}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-2">ENGAGEMENT BOOST:</div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {Object.entries(post.metrics).map(([key, value]) => (
                          <span key={key} className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            <span className="inline-flex items-center gap-1">
              👆 Swipe to see more examples
            </span>
          </p>
          <Button 
            variant="outline" 
            size="lg"
            className="mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
          >
            Try It Free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Results;


