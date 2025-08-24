import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_is_active: boolean;
  subscription_price_id: string | null;
  subscription_plan: string | null;
  subscription_price_display: string | null;
  subscription_credits_per_month: number | null;
  current_period_end: string | null;
}

const planCatalog: Record<string, { name: string; priceDisplay: string; creditsPerMonth: number }> = {
  'price_1RzSaW8SXkriWv0Z16p61EsZ': { name: 'free', priceDisplay: '$0', creditsPerMonth: 10 },
  'price_1RzSaY8SXkriWv0Z2B9s1cZ3': { name: 'pro', priceDisplay: '$9', creditsPerMonth: 50 },
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    }

    if (data) {
      const priceId = (data as any).subscription_price_id as string | null;
      (data as any).subscription_plan = planCatalog[priceId as keyof typeof planCatalog]?.name || 'none';
      (data as any).subscription_price_display = planCatalog[priceId as keyof typeof planCatalog]?.priceDisplay || '$0';
      (data as any).subscription_credits_per_month = planCatalog[priceId as keyof typeof planCatalog]?.creditsPerMonth || 0;
    }

    setProfile(data as unknown as UserProfile);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, refetch: fetchProfile };
}
