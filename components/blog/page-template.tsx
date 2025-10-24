'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Star, Zap, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface BlogPage {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string;
  heroImage?: string;
  features?: any[];
  ctaText: string;
  ctaLink: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPageTemplateProps {
  page: BlogPage;
}

export default function BlogPageTemplate({ page }: BlogPageTemplateProps) {
  const router = useRouter();

  const handleCTAClick = () => {
    if (page.ctaLink.startsWith('/')) {
      router.push(page.ctaLink);
    } else {
      window.open(page.ctaLink, '_blank');
    }
  };

  const renderBlogLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              Playbook
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {page.subtitle}
              </p>
            )}
            {page.heroImage && (
              <div className="mb-8">
                <img
                  src={page.heroImage}
                  alt={page.title}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators who are already using Social Fox to grow their audience.
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderComparisonLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              Comparison
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {page.subtitle}
              </p>
            )}
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      {page.features && page.features.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Feature Comparison
              </h2>
              <div className="grid gap-8">
                {page.features.map((feature: any, index: number) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {feature.socialFox ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-5 w-5 mr-1" />
                            <span className="font-medium">Social Fox</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <span className="font-medium">Limited</span>
                          </div>
                        )}
                        {feature.competitor ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-5 w-5 mr-1" />
                            <span className="font-medium">Competitor</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <span className="font-medium">Limited</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to make the switch?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators who chose Social Fox for their growth.
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderIntegrationLayout = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              Integration
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {page.subtitle}
              </p>
            )}
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features List */}
      {page.features && page.features.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                What you get
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {page.features.map((feature: any, index: number) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {feature.icon === 'star' && <Star className="h-6 w-6 text-orange-500" />}
                        {feature.icon === 'zap' && <Zap className="h-6 w-6 text-orange-500" />}
                        {feature.icon === 'trending' && <TrendingUp className="h-6 w-6 text-orange-500" />}
                        {!feature.icon && <Check className="h-6 w-6 text-orange-500" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to integrate?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get started with Social Fox today and unlock powerful integrations.
            </p>
            <Button
              size="lg"
              onClick={handleCTAClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {page.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );

  // Render based on page type
  switch (page.type) {
    case 'blog':
      return renderBlogLayout();
    case 'comparison':
      return renderComparisonLayout();
    case 'integration':
      return renderIntegrationLayout();
    default:
      return renderBlogLayout();
  }
}
