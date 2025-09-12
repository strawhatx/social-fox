"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { products } from '@/lib/utils';

interface SubscriptionData {
  plan: string;
  status: string;
  subscriptionId?: string;
  expiry?: string;
  planDetails: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: string[];
    limits: {
      monthlyPosts: number;
      aiRewrites: number;
      scheduledPosts: number;
    };
  };
}

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    // You'll need to replace these with your actual Lemon Squeezy product IDs
    const productIds: Record<string, string> = {
      explore: products.explore,
      creator: products.creative
    };

    const productId = productIds[planId];
    if (!productId) {
      toast({
        title: 'Error',
        description: 'Product not found. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    // Open Lemon Squeezy checkout
    const checkoutUrl = `https://app.lemonsqueezy.com/checkout/buy/${productId}`;
    window.open(checkoutUrl, '_blank');
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create customer portal');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open customer portal. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading subscription details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Unable to load subscription details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, planDetails } = subscription;
  const isActive = status === 'active';

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{planDetails.name}</h3>
              <p className="text-sm text-muted-foreground">
                ${planDetails.price}/{planDetails.interval}
              </p>
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'} className="bg-gradient-to-r from-orange-500 to-red-500">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
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
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Plan Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options: Always show both paid plans for upgrade */}
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
                <span className="text-lg font-bold">$5/month</span>
              </div>
              <ul className="text-sm space-y-1">
                <li>• 20 Content Copilot drafts</li>
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
                <li>• 150 Content Copilot drafts per month</li>
                <li>• 100 scheduled posts per month</li>
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
  );
}
