"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Lock } from 'lucide-react';
import useSubscription from '@/hooks/use-subscription';
import { useUser } from '@clerk/nextjs';
import { isAdmin } from '@/lib/admin';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { subscription, loading, upgrade, openBillingPortal } = useSubscription();
  const { user } = useUser();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (subscription && subscription.status !== 'active') {
      setShowPaymentModal(true);
    }
  }, [subscription]);

  const handleUpgrade = async (planId: string) => {
    await upgrade(planId as 'explore' | 'creator');
  };

  const handleManageSubscription = async () => {
    await openBillingPortal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has active subscription
  const hasActiveSubscription = subscription?.status === 'active';

  // Admins bypass subscription gating
  if (user && isAdmin(user.id)) {
    return <>{children}</>;
  }

  if (!hasActiveSubscription) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
            <div className="text-center max-w-md mx-auto p-6">
              <Lock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-700 mb-2">Subscription Required</h1>
              <p className="text-orange-600 mb-6">
                You need an active subscription to access this feature.
              </p>
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-700">
                <Crown className="h-5 w-5" />
                Choose Your Plan
              </DialogTitle>
              <DialogDescription className="text-orange-600">
                Unlock all features with a subscription
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Explore Plan */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Explore</span>
                    <Badge className="bg-orange-100 text-orange-700">Popular</Badge>
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-orange-600">$9</span>
                    <span className="text-orange-500">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      30 Content Copilot drafts
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      10 scheduled posts per month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Starter Library
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Basic support
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('explore')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Choose Explore
                  </Button>
                </CardContent>
              </Card>

              {/* Creative Plan */}
              <Card className="border-orange-300 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Creative</span>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Best Value</Badge>
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-orange-600">$29</span>
                    <span className="text-orange-500">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Everything in Explore
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      120 Content Copilot drafts per month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      75 scheduled posts per month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Custom Library
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade('creator')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Choose Creative
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Current Status */}
            {subscription && (
              <div className="mt-6 p-4 bg-orange-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Current Plan: {subscription.planDetails.name}</p>
                    <p className="text-xs text-orange-600">Status: {subscription.status}</p>
                  </div>
                  {subscription.subscriptionId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleManageSubscription}
                      className="border-orange-200 text-orange-600 hover:bg-orange-200"
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // User has active subscription, render children
  return <>{children}</>;
}
