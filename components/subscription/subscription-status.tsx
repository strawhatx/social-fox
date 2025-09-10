"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';

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

export default function SubscriptionStatus() {
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="animate-pulse bg-orange-200 rounded h-4 w-16"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Lock className="h-4 w-4 text-orange-500" />
        <span className="text-xs text-orange-600">Explore Plan</span>
      </div>
    );
  }

  const { status, planDetails } = subscription;
  const isActive = status === 'active';

  return (
    <div className="flex items-center gap-2 p-2">
      <Crown className="h-4 w-4 text-orange-500" />
      <span className="text-xs text-orange-600">{planDetails.name}</span>
      <Badge 
        variant={isActive ? 'default' : 'secondary'} 
        className={`text-xs ${isActive ? 'bg-green-500' : 'bg-orange-200 text-orange-700'}`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}
