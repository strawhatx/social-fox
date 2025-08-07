import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Heart } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: "🤖",
      title: "Auto-generates platform-specific posts",
      description: "Smart AI analyzes your commits, PRs, and releases to create engaging posts tailored for each platform."
    },
    {
      icon: "in",
      title: "Optimized for Twitter/X and LinkedIn",
      description: "Each post is crafted with platform-specific best practices, hashtags, and formatting for maximum engagement."
    },
    {
      icon: "⚙️",
      title: "Customizable tone and format",
      description: "Choose your voice — professional, casual, or technical. Customize templates to match your personal brand."
    },
    {
      icon: "⏰",
      title: "Post on your schedule",
      description: "Get ready-to-post content generated from your commits. Post immediately or save for later."
    },
    {
      icon: "✅",
      title: "One-click approval workflow",
      description: "Review and approve posts before they go live. Make quick edits or post instantly with confidence."
    }
  ];

  const audienceTags = [
    "SaaS Developers",
    "Solo Founders", 
    "Open Source Maintainers",
    "Technical Writers"
  ];

  const testimonials = [
    {
      icon: "💬",
      quote: "Built to scratch our own itch — now we're opening it up to others who struggle to keep up with posting their progress. No fluff, just what we wish existed."
    },
    {
      icon: "👥",
      quote: "We're in beta — looking for 10 users to try it and give brutally honest feedback."
    }
  ];

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email signup logic here
    console.log('Email signup:', email);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">🦊</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-gray-900">Social</span>
              <span className="text-orange-500"> Fox</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="gradient" onClick={() => navigate('/auth')}>
              Join the Beta
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg relative">
              <span className="text-white text-2xl">🦊</span>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="text-gray-900">Social</span>
                <span className="text-orange-500"> Fox</span>
              </h1>
              <p className="text-xl text-gray-700 mt-2">Let your code do the talking.</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Social Fox turns your GitHub activity into engaging, ready-to-post content for Twitter/X and LinkedIn — so indie hackers and busy founders can stay active on their own schedule.
          </p>

          {/* Process Flow */}
          <div className="flex items-center justify-center space-x-8 py-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🐙</span>
              </div>
              <span className="text-gray-700 font-medium">GitHub Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-0.5 w-8 bg-gray-300"></div>
              <span className="text-orange-500 text-sm">⚡</span>
              <div className="h-0.5 w-8 bg-gray-300"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🐦</span>
                </div>
                <span className="text-gray-700 font-medium">Twitter/X</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">in</span>
                </div>
                <span className="text-gray-700 font-medium">LinkedIn</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="gradient" onClick={() => navigate('/auth')} className="text-lg px-8">
              Join the Beta
            </Button>
            <Button size="lg" variant="modern" onClick={() => navigate('/auth')}>
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Build in public, effortlessly</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Focus on building great products while Social Fox keeps your audience engaged with your progress.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="card-modern border-0">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 text-3xl">{feature.icon}</div>
                <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Perfect for Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Perfect for indie hackers and busy founders</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Stop choosing between building your product and building your audience. With Social Fox, your code commits become ready-to-share content that you can post whenever you want.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {audienceTags.map((tag, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-white font-medium">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by builders, for builders</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're scratching our own itch — and we think you'll love it too.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-modern border-0">
              <CardContent className="p-8 text-center">
                <div className="text-3xl mb-4">{testimonial.icon}</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-orange-500 fill-current" /> by indie hackers who get it
          </p>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg relative">
                <span className="text-white text-lg">🦊</span>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Ready to let your code do the talking?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join the beta and start turning your GitHub activity into ready-to-share social media content. No more writer's block, no more missed opportunities to build in public.
              </p>
            </div>

            <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-14 rounded-xl border-gray-600 bg-gray-800 text-white placeholder-gray-400"
                  required
                />
              </div>
              <Button type="submit" variant="gradient" size="lg" className="h-14 px-8">
                Join the Beta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <p className="text-sm text-gray-400">
              Be one of the first to try Social Fox. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;