import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const planConfig = {
  price_1RxAuj4cECBWesjx3nqOMQru: {
    type: 'free',
    credits: 10,
  },
  price_1RxAwM4cECBWesjxNKynZfd6: {
    type: 'pro',
    credits: 50,
  },
}

interface UserSubscription {
  subscription_plan: string | null;
  subscription_price_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_is_active: boolean;
}

interface UserCredits {
  credits: number;
  additional_credits: number;
  total_credits: number;
}

interface SubscriptionData {
  subscription: UserSubscription | null;
  credits: UserCredits | null;
  loading: boolean;
  hasPaidSubscription: boolean;
  hasCredits: (required?: number) => boolean;
  canConnectApps: boolean;
  canSchedulePosts: boolean;
  refetch: () => Promise<void>;
}

export const useSubscription = (): SubscriptionData => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = async () => {
    if (!user) {
      setSubscription(null);
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch subscription plan/active status and optional Stripe IDs
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_price_id, subscription_is_active, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching subscription:', profileError);
        return;
      }

      // set the plan type from the config
      const priceId = (profileData as any)?.subscription_price_id as string | null;
      const computedPlan = planConfig[priceId as keyof typeof planConfig]?.type || 'none';

      setSubscription({
        ...(profileData as any),
        subscription_plan: computedPlan,
      } as UserSubscription);

      // Fetch credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits, additional_credits')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching credits:', creditsError);
        return;
      }

      if (creditsData) {
        setCredits({
          credits: creditsData.credits || 0,
          additional_credits: creditsData.additional_credits || 0,
          total_credits: (creditsData.credits || 0) + (creditsData.additional_credits || 0)
        });
      }

      else {
        setCredits({
          credits: 0,
          additional_credits: 0,
          total_credits: 0
        });
      }
    }

    catch (error) {
      console.error('Error fetching subscription data:', error);
    }

    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  // User must have an active plan to use main features
  const hasPaidSubscription = !!subscription?.subscription_is_active;

  const hasCredits = (required: number = 1) => {
    return (credits?.total_credits || 0) >= required;
  };

  const canConnectApps = hasPaidSubscription;
  const canSchedulePosts = hasPaidSubscription && hasCredits(1);

  return {
    subscription,
    credits,
    loading,
    hasPaidSubscription,
    hasCredits,
    canConnectApps,
    canSchedulePosts,
    refetch: fetchSubscriptionData
  };
};
