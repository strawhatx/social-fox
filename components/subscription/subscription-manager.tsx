"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, DivideCircle, Zap } from 'lucide-react';
import useSubscription from '@/hooks/use-subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export default function SubscriptionManager() {
  const { subscription, loading, upgrade, openBillingPortal } = useSubscription();

  const handleUpgrade = async (action: string) => {
    await upgrade(action as 'launch' | 'grow');
  }

  const handleManageSubscription = async () => {
    await openBillingPortal();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-md font-semibold">
            <Crown className="h-5 w-5 text-orange-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Loading subscription details...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, planDetails } = subscription || {};
  const isActive = status === 'active';

  return (
    <div className="space-y-6">
      {isActive ? (
        // Current Plan and Manage Option
        <div>
          <div className="flex items-center gap-2 text-md font-semibold mb-4">
            <Crown className="h-5 w-5 text-orange-500" />
            Current Plan
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">{planDetails?.name}</h3>
              <p className="text-xs text-muted-foreground">
                ${planDetails?.price}/{planDetails?.interval}
              </p>
            </div>
          </div>

          {isActive && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-100"
            >
              Manage Subscription
            </Button>
          )}
        </div>
      ) : (
        // Subscription Selection if not active or missing
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            You don&apos;t have an active subscription. Please select a plan to continue.
          </p>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>
                Unlock more features and higher limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`border rounded-lg p-4 space-y-3 ${
                      plan.popular ? 'border-orange-200 bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <span className="text-lg font-bold">${plan.price}/{plan.interval}</span>
                    </div>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleUpgrade(plan.action)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <hr className="my-2" />

      {/* Plan Features */}
      <div className="w-full">
        <div className="flex items-center gap-2 text-md font-semibold mb-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Plan Features
        </div>

        <div className="space-y-2">
          {planDetails?.features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
