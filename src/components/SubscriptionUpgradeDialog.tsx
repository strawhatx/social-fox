import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, CreditCard, ExternalLink } from 'lucide-react';
import { STRIPE_URLS } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';

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
  const { user } = useAuth();
  const { toast } = useToast();
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

  const handlePlanSelect = (url: string) => {
    window.open(`${url}?prefilled_email=${encodeURIComponent(user?.email || '')}`, '_blank');
    onClose();
  };

  const handleFreePlanSelect = async () => {
    const { data, error } = await fetchWithAuth('create-free-subscription', { method: 'POST' });
    if (error) {
      toast({
        title: 'Something went wrong',
        description: error.message || 'Unable to start subscription',
        variant: 'destructive',
      });
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
      handlePlanSelect: handleFreePlanSelect,
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
      handlePlanSelect: () => handlePlanSelect(STRIPE_URLS.PRO_SUBSCRIPTION),
      recommended: feature === 'scheduling'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {title || getFeatureTitle()}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {description || getFeatureDescription()}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.recommended ? 'border-primary shadow-sm' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1 text-sm">/{plan.period}</span>
                </div>
                <div className="text-xs font-medium text-primary mt-1 flex items-center justify-center">
                  <Zap className="w-3 h-3 mr-1" />
                  {plan.credits}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-1 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-xs">
                      <Check className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={plan.handlePlanSelect}
                  className={`w-full py-2 ${plan.recommended ? 'bg-primary hover:bg-primary/90' : ''}`}
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
              <CardContent className="pt-4 text-center">
                <h3 className="font-semibold mb-2">Need More Credits?</h3>
                <p className="text-sm text-muted-foreground mb-3">
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
