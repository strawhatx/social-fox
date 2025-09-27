// Centralized feature configuration system
export interface QuotaFeature {
  name: string;
  description: string;
  limits: {
    explore: number;
    creator: number;
  };
}

export interface BinaryFeature {
  name: string;
  description: string;
  enabled: {
    explore: boolean;
    creator: boolean;
  };
}

export interface UserPlan {
  id: string;
  name: 'explore' | 'creator';
  displayName: string;
  price: number;
}

// Quota-based features (with usage limits)
export const QUOTA_FEATURES: Record<string, QuotaFeature> = {
  copilotDrafts: {
    name: 'Copilot Drafts',
    description: 'Generate AI-powered social media posts with Copilot',
    limits: {
      explore: 30,
      creator: 150
    }
  },
  scheduledPosts: {
    name: 'Scheduled Posts',
    description: 'Schedule posts for future publishing',
    limits: {
      explore: 10,
      creator: 100
    }
  }
};

// Binary features (enabled/disabled)
export const BINARY_FEATURES: Record<string, BinaryFeature> = {
  starterTemplates: {
    name: 'Starter Templates',
    description: 'Use starter templates to get started',
    enabled: {
      explore: true,
      creator: true
    }
  },
  customTemplates: {
    name: 'Custom Templates',
    description: 'Create and manage custom templates',
    enabled: {
      explore: false,
      creator: true
    }
  }
};

// Plan definitions
export const PLANS: Record<string, UserPlan> = {
  explore: {
    id: 'explore',
    name: 'explore',
    displayName: 'Explore',
    price: 5
  },
  creator: {
    id: 'creator',
    name: 'creator',
    displayName: 'Creator',
    price: 15
  }
};

// Utility functions
export function getFeatureLimit(featureName: string, planName: 'explore' | 'creator'): number {
  const feature = QUOTA_FEATURES[featureName];
  if (!feature) return 0;
  return feature.limits[planName] || 0;
}

export function isFeatureEnabled(featureName: string, planName: 'explore' | 'creator'): boolean {
  const feature = BINARY_FEATURES[featureName];
  if (!feature) return false;
  return feature.enabled[planName] || false;
}

export function getFeatureConfig(featureName: string): QuotaFeature | null {
  return QUOTA_FEATURES[featureName] || null;
}

export function getAllFeaturesForPlan(planName: 'explore' | 'creator'): Record<string, { enabled: boolean; limit: number }> {
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
  planName: 'explore' | 'creator', 
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
  explore: Object.fromEntries(
    Object.entries(QUOTA_FEATURES).map(([key, feature]) => [key, feature.limits.explore])
  ),
  creator: Object.fromEntries(
    Object.entries(QUOTA_FEATURES).map(([key, feature]) => [key, feature.limits.creator])
  )
};

// Get upgrade suggestions
export function getUpgradeSuggestions(
  featureName: string,
  currentPlan: 'explore' | 'creator'
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
