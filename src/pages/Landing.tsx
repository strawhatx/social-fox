import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Target, BarChart3, Users, MessageSquare, Lightbulb } from 'lucide-react';

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
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Content Generation",
      description: "Generate engaging content across multiple platforms with advanced AI agents"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Multi-Platform Management",
      description: "Manage Twitter, LinkedIn, Instagram and more from a single dashboard"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Insights",
      description: "Track performance and optimize your marketing strategy with detailed analytics"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Audience Research",
      description: "Understand your audience better with AI-driven research and insights"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Community Engagement",
      description: "Build and nurture your community with automated engagement tools"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Campaign Planning",
      description: "Plan and execute marketing campaigns with AI-assisted strategy development"
    }
  ];

  const roles = [
    "Brand Builder",
    "Content Creator", 
    "Audience Researcher",
    "Campaign Planner",
    "Channel Manager",
    "Analytics Tracker",
    "Lead Generator",
    "Community Engager",
    "Growth Hacker"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Social Story Shaper</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Marketing Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Transform Your Social Media Strategy with AI Agents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Harness the power of 9 specialized AI marketing agents to create, manage, and optimize your social media presence across all platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Marketers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build a successful social media presence, powered by artificial intelligence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">9 Specialized AI Marketing Agents</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each agent is designed with a specific expertise to handle different aspects of your marketing strategy.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {roles.map((role, index) => (
            <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
              {role}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of marketers who are already using AI agents to scale their social media presence and drive real business results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Social Story Shaper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;