'use client';

import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getPriceId } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

const Pricing = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const plans = [SUBSCRIPTION_PLANS.launch, SUBSCRIPTION_PLANS.grow];

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
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
            <Zap className="w-4 h-4" />
            <span>Pricing / Tiers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
            Pick the plan that matches your goals
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Upgrade anytime as your content needs grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const getPlanColors = (planId: string) => {
              if (planId === 'launch') return {
                border: 'border-green-200/50 dark:border-green-800/50',
                hoverBorder: 'hover:border-green-300 dark:hover:border-green-700',
                bg: 'bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10',
                iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
                button: 'bg-green-500 hover:bg-green-600 text-white',
                check: 'text-green-500'
              };
              if (planId === 'grow') return {
                border: 'border-orange-200/50 dark:border-orange-800/50',
                hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
                bg: 'bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10',
                iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                button: 'bg-orange-500 hover:bg-orange-600 text-white',
                check: 'text-orange-500'
              };
              return {
                border: 'border-orange-200/50 dark:border-orange-800/50',
                hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
                bg: 'bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10',
                iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
                button: 'bg-orange-500 hover:bg-orange-600 text-white',
                check: 'text-orange-500'
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
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
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
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Instant credit activation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Upgrade anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;