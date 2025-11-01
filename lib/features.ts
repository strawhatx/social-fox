// Centralized feature configuration system
export interface QuotaFeature {
  name: string;
  description: string;
  limits: {
    launch: number;
    grow: number;
  };
}

export interface BinaryFeature {
  name: string;
  description: string;
  enabled: {
    launch: boolean;
    grow: boolean;
  };
}

export interface UserPlan {
  id: string;
  name: 'launch' | 'grow';
  displayName: string;
  price: number;
}

// Quota-based features (with usage limits)
export const QUOTA_FEATURES: Record<string, QuotaFeature> = {
  scheduledPosts: {
    name: 'Scheduled Posts',
    description: 'Schedule posts for future publishing',
    limits: {
      launch: 30,
      grow: 120
    }
  },
  threads: {
    name: 'Threads',
    description: 'Create multi-tweet thread content',
    limits: {
      launch: 4,
      grow: 8,
    }
  }
};

// Binary features (enabled/disabled)
export const BINARY_FEATURES: Record<string, BinaryFeature> = {
  analytics: {
    name: 'Analytics',
    description: 'Track post performance and engagement',
    enabled: {
      launch: true,
      grow: true
    }
  },
  automation: {
    name: 'AI Automation',
    description: 'Automated content generation and optimization',
    enabled: {
      launch: false,
      grow: true
    }
  },
  contentLibrary: {
    name: 'Content Library',
    description: 'Save, remix, and auto-fill winning posts',
    enabled: {
      launch: true,
      grow: true
    }
  },
  aiGeneration: {
    name: 'AI Generation',
    description: 'AI-powered content creation',
    enabled: {
      launch: false,
      grow: true
    }
  },
  teamAccess: {
    name: 'Team Access',
    description: 'Collaborate with team members',
    enabled: {
      launch: false,
      grow: false
    }
  },
  prioritySupport: {
    name: 'Priority Support',
    description: 'Priority customer support',
    enabled: {
      launch: false,
      grow: false
    }
  }
};

// Plan definitions
export const PLANS: Record<string, UserPlan> = {
  launch: {
    id: 'launch',
    name: 'launch',
    displayName: 'Launch',
    price: 19
  },
  grow: {
    id: 'grow',
    name: 'grow',
    displayName: 'Grow',
    price: 39
  }
};

// Utility functions
export function getFeatureLimit(featureName: string, planName: 'launch' | 'grow'): number {
  const feature = QUOTA_FEATURES[featureName];
  if (!feature) return 0;
  return feature.limits[planName] || 0;
}

export function isFeatureEnabled(featureName: string, planName: 'launch' | 'grow'): boolean {
  const feature = BINARY_FEATURES[featureName];
  if (!feature) return false;
  return feature.enabled[planName] || false;
}

export function getFeatureConfig(featureName: string): QuotaFeature | null {
  return QUOTA_FEATURES[featureName] || null;
}

export function getAllFeaturesForPlan(planName: 'launch' | 'grow'): Record<string, { enabled: boolean; limit: number }> {
  const result: Record<string, { enabled: boolean; limit: number }> = {};
  
  Object.keys(QUOTA_FEATURES).forEach(featureName => {
    result[featureName] = {
      enabled: isFeatureEnabled(featureName, planName),
      limit: getFeatureLimit(featureName, planName)
    };
  });
  
  return result;
}

// Check if user can use a feature
export function canUseFeature(
  featureName: string, 
  planName: 'launch' | 'grow', 
  currentUsage: number
): { canUse: boolean; reason?: string } {
  const feature = QUOTA_FEATURES[featureName];
  if (!feature) {
    return { canUse: false, reason: 'Feature not found' };
  }

  if (!isFeatureEnabled(featureName, planName)) {
    return { canUse: false, reason: 'Feature not available in your plan' };
  }

  const limit = getFeatureLimit(featureName, planName);
  if (currentUsage >= limit) {
    return { canUse: false, reason: 'Usage limit reached' };
  }

  return { canUse: true };
}

// Plan limits mapping for easy access
export const planLimits = {
  launch: Object.fromEntries(
    Object.entries(QUOTA_FEATURES).map(([key, feature]) => [key, feature.limits.launch])
  ),
  grow: Object.fromEntries(
    Object.entries(QUOTA_FEATURES).map(([key, feature]) => [key, feature.limits.grow])
  )
};

// Get upgrade suggestions
export function getUpgradeSuggestions(
  featureName: string,
  currentPlan: 'launch' | 'grow'
): { plan: string; limit: number }[] {
  const feature = QUOTA_FEATURES[featureName];
  if (!feature) return [];

  const suggestions: { plan: string; limit: number }[] = [];
  
  Object.entries(feature.limits).forEach(([plan, limit]) => {
    if (plan !== currentPlan && limit > feature.limits[currentPlan]) {
      suggestions.push({ plan, limit });
    }
  });

  return suggestions.sort((a, b) => b.limit - a.limit);
}
