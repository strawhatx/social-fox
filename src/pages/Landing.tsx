import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Target, BarChart3, Users, MessageSquare, Lightbulb, Monitor, Clock, CheckCircle } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Auto-generates platform-specific posts",
      description: "Smart AI analyzes your commits, PRs, and releases to create engaging posts tailored for each platform."
    },
    {
      icon: <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><div className="w-3 h-3 bg-blue-600 rounded-sm"></div></div>,
      title: "Optimized for Twitter/X and LinkedIn",
      description: "Each post is crafted with platform-specific best practices, hashtags, and formatting for maximum engagement."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Customizable tone and format",
      description: "Choose your voice — professional, casual, or technical. Customize templates to match your personal brand."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Post on your schedule",
      description: "Get ready-to-post content generated from your commits. Post immediately or save for later."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "One-click approval workflow",
      description: "Review and approve posts before they go live. Make quick edits or post instantly with confidence."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Insights",
      description: "Track performance and optimize your marketing strategy with detailed analytics and engagement metrics."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-orange-50/20">
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
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
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
              <Zap className="h-5 w-5 text-orange-500" />
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

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Build in public, effortlessly</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Focus on building great products while Social Fox keeps your audience engaged with your progress.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-modern border-0">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-16 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to build in public?</h2>
            <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg">
              Join indie hackers and founders who are already using Social Fox to stay active on social media without the hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="modern" onClick={() => navigate('/auth')} className="text-lg px-8">
                Join the Beta
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-gray-900">
                See How It Works
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 Social Fox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;