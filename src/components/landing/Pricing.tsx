import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      credits: "10 credits",
      features: [
        "10 monthly credits",
        "Basic automation",
        "1 project",
        "Email support"
      ],
      buttonText: "Get Started",
      popular: false,
      action: "signup"
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      credits: "50 credits",
      features: [
        "50 monthly credits",
        "Advanced automation",
        "Unlimited projects",
        "Priority support",
        "Custom scheduling"
      ],
      buttonText: "Start Pro",
      popular: true,
      action: "subscribe"
    },
    {
      name: "Credits Top-up",
      price: "$5",
      period: "one-time",
      credits: "50 additional credits",
      features: [
        "50 extra credits",
        "Never expires",
        "Works with any plan",
        "Instant activation"
      ],
      buttonText: "Buy Credits",
      popular: false,
      action: "buy-credits"
    }
  ];

  const handlePlanAction = (action: string) => {
    switch (action) {
      case 'signup':
        // Keep existing auth signup flow. If you prefer using a Stripe "Free" link, let us know.
        window.location.href = '/auth';
        break;
      case 'subscribe':
        // Open Stripe Checkout for Pro (50 credits/month)
        window.open('https://buy.stripe.com/test_9B68wIgrRdwhd6T9AD3VC01', '_blank');
        break;
      case 'buy-credits':
        // Open Stripe Checkout for additional 50 credits (one-time)
        window.open('https://buy.stripe.com/test_28E00cfnNbo9ff10033VC02', '_blank');
        break;
    }
  };
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Credit-Based Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. Start free, upgrade when you need more automation power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
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
                <CardDescription className="text-lg font-medium text-primary mt-2">
                  <Zap className="inline w-4 h-4 mr-1" />
                  {plan.credits}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
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