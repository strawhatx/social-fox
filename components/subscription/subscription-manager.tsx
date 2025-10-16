"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, DivideCircle, Zap } from 'lucide-react';
import useSubscription from '@/hooks/use-subscription';

export default function SubscriptionManager() {
  const { subscription, loading, upgrade, openBillingPortal } = useSubscription();

  const handleUpgrade = async (action: string) => {
    await upgrade(action as 'explore' | 'creator');
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
          <div className="flex items-center gap-2 text-md font-semibold mb-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Current Plan
          </div>

          <div className="flex items-center justify-between">
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
            You don't have an active subscription. Please select a plan to continue.
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
                {/* Explore Plan */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Explore</h3>
                    <span className="text-lg font-bold">$9/month</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• 30 drafts(10 ideas x 3  variations)</li>
                    <li>• 10 scheduled posts per month</li>
                    <li>• Starter Library</li>
                    <li>• Basic support</li>
                  </ul>
                  <Button
                    onClick={() => handleUpgrade('explore')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Upgrade to Explore
                  </Button>
                </div>

                {/* Creator Plan */}
                <div className="border rounded-lg p-4 space-y-3 border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Creative</h3>
                    <span className="text-lg font-bold">$29/month</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Everything in Explore</li>
                    <li>• 120 drafts(40 ideas x 3 variations)</li>
                    <li>• 75 scheduled posts</li>
                    <li>• Custom Library</li>
                    <li>• Priority support</li>
                  </ul>
                  <Button
                    onClick={() => handleUpgrade('creator')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Upgrade to Creative
                  </Button>
                </div>
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
