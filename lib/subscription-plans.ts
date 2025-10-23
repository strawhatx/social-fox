export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  interval: 'month' | 'year';
  period: string;
  action: string;
  buttonText: string;
  features: string[];
  limits: Record<string, number | boolean>;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  launch: {
    id: 'launch',
    name: 'Never Miss a Post Again',
    price: 19,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'launch',
    buttonText: 'Choose Tier 1',
    features: [
      '30 scheduled posts/mo',
      'Up to 4 threads',
      'Limited analytics',
      'Basic automation',
      'Access to content library (view only)'
    ],
    limits: {
      scheduledPosts: 30,
      threads: 4,
      analytics: 'basic',
      automation: false,
      contentLibrary: 'view_only',
      aiGeneration: false
    }
  },
  grow: {
    id: 'grow',
    name: 'Grow Your Reach',
    price: 49,
    popular: true,
    interval: 'month',
    period: 'month',
    action: 'grow',
    buttonText: 'Choose Tier 2',
    features: [
      '60 scheduled posts/mo',
      '8 threads',
      'Analytics included',
      'Partial AI automation',
      'Full content library access'
    ],
    limits: {
      scheduledPosts: 60,
      threads: 8,
      analytics: 'advanced',
      automation: 'partial',
      contentLibrary: 'full',
      aiGeneration: 'assist'
    }
  },
  scale: {
    id: 'scale',
    name: 'Set It & Forget It',
    price: 99,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'scale',
    buttonText: 'Choose Tier 3',
    features: [
      '150 scheduled posts/mo',
      '15 threads',
      'Full AI automation + all features',
      'Full analytics',
      'Team access',
      'Content library (save, remix, and auto-fill winning posts)',
      'Priority support'
    ],
    limits: {
      scheduledPosts: 150,
      threads: 15,
      analytics: 'advanced',
      automation: 'full',
      contentLibrary: 'full',
      aiGeneration: 'unlimited',
      teamAccess: true,
      prioritySupport: true
    }
  }
};

export default SUBSCRIPTION_PLANS;


