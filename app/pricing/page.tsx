'use client';

import { Check, Zap, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getPriceId } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

const PricingPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const plans = [SUBSCRIPTION_PLANS.launch, SUBSCRIPTION_PLANS.grow, SUBSCRIPTION_PLANS.scale];

  const handlePlanAction = (action: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const priceId = getPriceId(action as any);
    if (!priceId) {
      router.push('/calendar');
      return;
    }

    // Create Stripe checkout session
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
      .then(response => response.json())
      .then(({ url }) => {
        if (url) window.location.href = url;
      })
      .catch(error => {
        console.error('Error creating checkout session:', error);
        router.push('/calendar');
      });
  };

  const comparisonFeatures = [
    { name: 'Scheduler & publishing', launch: true, grow: true, scale: true },
    { name: 'Basic analytics', launch: true, grow: true, scale: true },
    { name: 'Threads', launch: true, grow: true, scale: true },
    { name: 'AI text generation', launch: '1/mo', grow: '5/mo', scale: '12/mo' },
    { name: 'AI rewrite', launch: true, grow: true, scale: true },
    { name: 'AI images', launch: false, grow: true, scale: true },
    { name: 'GIF support', launch: false, grow: false, scale: true },
    { name: 'Posts / month', launch: '30', grow: '120', scale: '250' },
    { name: 'Threads / month', launch: '4', grow: '9', scale: '20' },
    { name: 'Support', launch: 'Standard', grow: 'Priority', scale: 'Dedicated' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
              <Zap className="w-4 h-4" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
              Choose Your Growth Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Start building your audience with consistent, AI-powered content. 
              Upgrade anytime as your needs grow.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const getPlanColors = (planId: string) => {
                if (planId === 'launch') return {
                  border: 'border-green-200/50 dark:border-green-800/50',
                  hoverBorder: 'hover:border-green-300 dark:hover:border-green-700',
                  bg: 'bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10',
                  iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
                  button: 'bg-green-500 hover:bg-green-600 text-white',
                  check: 'text-green-500',
                  badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                };
                if (planId === 'grow') return {
                  border: 'border-orange-200/50 dark:border-orange-800/50',
                  hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
                  bg: 'bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10',
                  iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                  button: 'bg-orange-500 hover:bg-orange-600 text-white',
                  check: 'text-orange-500',
                  badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                };
                if (planId === 'scale') return {
                  border: 'border-blue-200/50 dark:border-blue-800/50',
                  hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
                  bg: 'bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10',
                  iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                  button: 'bg-blue-500 hover:bg-blue-600 text-white',
                  check: 'text-blue-500',
                  badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                };
                return {
                  border: 'border-gray-200/50 dark:border-gray-800/50',
                  hoverBorder: 'hover:border-gray-300 dark:hover:border-gray-700',
                  bg: 'bg-gradient-to-br from-gray-50/30 to-transparent dark:from-gray-950/10',
                  iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
                  button: 'bg-gray-500 hover:bg-gray-600 text-white',
                  check: 'text-gray-500',
                  badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                };
              };

              const colors = getPlanColors(plan.id);
              
              return (
                <Card
                  key={index}
                  className={`group relative backdrop-blur-md bg-white/70 dark:bg-background/70 ${colors.border} ${colors.bg} ${colors.hoverBorder} transition-all duration-300 hover:shadow-xl ${plan.popular ? 'shadow-lg scale-105 border-orange-300 dark:border-orange-700' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className={`${colors.badge} px-6 py-2 text-sm font-semibold shadow-lg`}>
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className={`absolute inset-0 bg-gradient-to-br from-${plan.id === 'launch' ? 'green' : plan.id === 'grow' ? 'orange' : 'blue'}-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <CardHeader className="text-center pb-6 relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-4 h-4 rounded-full mr-3 ${colors.iconBg.replace('bg-gradient-to-br from-', 'bg-').replace(' to-', '-')}`}></div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {plan.id === 'launch' ? 'Starter' : plan.id === 'grow' ? 'Most Popular' : 'Power Operators'}
                      </span>
                    </div>
                    <CardTitle className="text-2xl font-bold mb-4">{plan.name}</CardTitle>
                    <div className="mb-6">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-2 text-lg">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-base text-muted-foreground italic leading-relaxed">
                      {plan.id === 'launch' && "For builders who are just starting consistent posting."}
                      {plan.id === 'grow' && "For creators who want consistent content output and growth."}
                      {plan.id === 'scale' && "For creators treating growth as a system."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className={`w-5 h-5 mr-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full group ${colors.button} font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                      variant="default"
                      onClick={() => handlePlanAction(plan.action)}
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See exactly what's included in each plan to choose the right one for your needs.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold">Launch</th>
                      <th className="text-center p-4 font-semibold">Grow</th>
                      <th className="text-center p-4 font-semibold">Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{feature.name}</td>
                        <td className="p-4 text-center">
                          {typeof feature.launch === 'boolean' ? (
                            feature.launch ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          ) : (
                            <span className="font-medium">{feature.launch}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.grow === 'boolean' ? (
                            feature.grow ? (
                              <Check className="w-5 h-5 text-orange-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          ) : (
                            <span className="font-medium">{feature.grow}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof feature.scale === 'boolean' ? (
                            feature.scale ? (
                              <Check className="w-5 h-5 text-blue-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          ) : (
                            <span className="font-medium">{feature.scale}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing differences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We'll notify you when you're approaching your limits. You can upgrade your plan 
                  or wait until your next billing cycle when limits reset.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 14-day free trial for all plans. No credit card required to start, 
                  and you can cancel anytime during the trial period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers. All payments 
                  are processed securely through Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your audience?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of creators who are building their audience with consistent, 
            AI-powered content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
              onClick={() => handlePlanAction('grow')}
            >
              Start with Grow Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold"
              onClick={() => router.push('/calendar')}
            >
              Try Free for 14 Days
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
