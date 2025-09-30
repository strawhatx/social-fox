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
  const plans = [SUBSCRIPTION_PLANS.explore, SUBSCRIPTION_PLANS.creator];

  const handlePlanAction = (action: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const priceId = getPriceId(action as 'explore' | 'creator');
    if (!priceId) {
      router.push('/dashboard');
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
        router.push('/dashboard');
      });
  };
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Beta Plans to crush your 𝕏 Game
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One account per user - help us polish this for founders who 🚢
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-orange-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <CardDescription className="text-lg font-medium text-orange-600 mt-2">
                  <Zap className="inline w-4 h-4 mr-1 text-orange-500" />
                  {plan.features[0]}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-orange-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-600 hover:bg-orange-50'}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanAction(plan.action)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include secure payment processing and instant credit activation
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;