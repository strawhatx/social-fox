import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, CreditCard, ExternalLink } from 'lucide-react';
import { STRIPE_URLS } from '@/lib/utils';

interface SubscriptionUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  feature?: 'connections' | 'scheduling' | 'credits';
}

export const SubscriptionUpgradeDialog = ({
  isOpen,
  onClose,
  title,
  description,
  feature = 'connections'
}: SubscriptionUpgradeDialogProps) => {
  const getFeatureTitle = () => {
    switch (feature) {
      case 'connections':
        return 'Connect Apps & Automate';
      case 'scheduling':
        return 'Schedule Content Posts';
      case 'credits':
        return 'Get More Credits';
      default:
        return 'Upgrade Your Plan';
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'connections':
        return 'Connect your social media accounts and data sources to automate content creation. Available with Free and Pro plans.';
      case 'scheduling':
        return 'Schedule your posts across multiple platforms. Requires credits to use.';
      case 'credits':
        return 'Buy more credits to schedule additional posts and use advanced features.';
      default:
        return 'Upgrade to unlock premium features and automations.';
    }
  };

  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "forever",
      credits: "10 credits/month",
      features: [
        "10 monthly credits",
        "Connect apps & platforms",
        "Basic automation",
        "1 project",
        "Email support"
      ],
      buttonText: "Get Free Plan",
      url: STRIPE_URLS.FREE_SUBSCRIPTION,
      recommended: feature === 'connections'
    },
    {
      name: "Pro Plan",
      price: "$9",
      period: "per month",
      credits: "50 credits/month",
      features: [
        "50 monthly credits",
        "Connect unlimited apps",
        "Advanced automation",
        "Unlimited projects",
        "Priority support",
        "Custom scheduling"
      ],
      buttonText: "Upgrade to Pro",
      url: STRIPE_URLS.PRO_SUBSCRIPTION,
      recommended: feature === 'scheduling'
    }
  ];

  const handlePlanSelect = (url: string) => {
    window.open(url, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {title || getFeatureTitle()}
          </DialogTitle>
          <p className="text-muted-foreground">
            {description || getFeatureDescription()}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.recommended ? 'border-primary shadow-md' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                </div>
                <div className="text-sm font-medium text-primary mt-1 flex items-center justify-center">
                  <Zap className="w-4 h-4 mr-1" />
                  {plan.credits}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.url)}
                  className={`w-full ${plan.recommended ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.recommended ? 'default' : 'outline'}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {plan.buttonText}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {feature === 'credits' && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold mb-2">Need More Credits?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Buy additional credits to schedule more posts
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handlePlanSelect(STRIPE_URLS.BUY_CREDITS)}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy 50 Extra Credits
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
