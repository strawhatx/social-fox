"use client";

import { useState, useEffect } from 'react';

interface FeatureAccess {
  feature: string;
  hasAccess: boolean;
  quota: {
    allowed: boolean;
    used: number;
    limit: number;
  };
}

export function useFeatureAccess(feature: 'posts' | 'ai_posts' | 'ai_rewrites' | 'starter_library_access' | 'my_library_access') {
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
    hasAccess: access?.hasAccess || false,
    quota: access?.quota || { allowed: false, used: 0, limit: 0 }
  };
}
