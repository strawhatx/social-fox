"use client";

import { useState, useEffect } from 'react';

interface FeatureAccess {
  canUse: boolean;
  reason?: string;
  currentPlan: string;
  featureConfig: {
    used: number;
    limit: number;
  };
}

export function useFeatureAccess(feature: string) {
  const [access, setAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/feature-access?feature=${feature}`);
        
        if (response.ok) {
          const data = await response.json();
          setAccess(data);
        } else {
          setError('Failed to check feature access');
        }
      } catch (err) {
        setError('Error checking feature access');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  return {
    access,
    loading,
    error,
    canUse: access?.canUse || false,
    used: access?.featureConfig?.used || 0,
    limit: access?.featureConfig?.limit || 0,
    plan: access?.currentPlan || 'explore'
  };
}
