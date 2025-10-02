"use client";

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { getPriceId } from '@/lib/utils';

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

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      }
    } catch (error) {
      // noop; components can decide UX for missing subscription
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgrade = useCallback(async (plan: 'explore' | 'creator') => {
    // Prevent duplicate purchases and simple downgrade
    if (subscription && subscription.status === 'active') {
      if (plan === (subscription.plan as 'explore' | 'creator')) {
        toast({
          title: 'Already Subscribed',
          description: `You already have an active ${subscription.plan} subscription.`,
          variant: 'destructive'
        });
        return;
      }

      if (plan === 'explore' && subscription.plan === 'creator') {
        toast({
          title: 'Cannot Downgrade',
          description: 'You cannot purchase explore when you already have a creator subscription.',
          variant: 'destructive'
        });
        return;
      }
    }

    const priceId = getPriceId(plan);
    if (!priceId) {
      toast({
        title: 'Error',
        description: 'Price not found. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      });
      if (!response.ok) throw new Error('Failed to create checkout session');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout. Please try again.',
        variant: 'destructive'
      });
    }
  }, [subscription]);

  const openBillingPortal = useCallback(async () => {
    try {
      const response = await fetch('/api/stripe/billing-portal', { method: 'POST' });
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
  }, []);

  return { subscription, loading, fetchSubscription, upgrade, openBillingPortal };
}

export default useSubscription;


