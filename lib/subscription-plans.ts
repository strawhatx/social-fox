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
  limits: Record<string, number | boolean | string | string[]>;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  launch: {
    id: 'launch',
    name: 'Launch — Starter',
    price: 16,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'launch',
    buttonText: 'Choose Launch',
    features: [
      'Schedule + publish to X',
      'Basic analytics',
      '1 connected X account',
      'Threads & singles',
      'AI post cleanup & 1 text generation / month',
      '30 posts / month',
      '4 threads / month',
      'Support: Standard'
    ],
    limits: {
      scheduledPosts: 30,
      threads: 4,
      analytics: false,
      automation: false,
      contentLibrary: true,
      aiGeneration: 1,
      connectedAccounts: 1,
      support: 'standard',
      mediaTypes: ['text']
    }
  },
  grow: {
    id: 'grow',
    name: 'Grow — Most Popular',
    price: 39,
    popular: true,
    interval: 'month',
    period: 'month',
    action: 'grow',
    buttonText: 'Choose Grow',
    features: [
      'Everything in Launch, plus:',
      'AI content generation (text + static images)',
      'Analytics insights & post history',
      'More scheduling power',
      '120 posts / month',
      '9 threads / month',
      '5 AI text generations / month',
      'Unlimited rewrites in editor',
      'Support: Priority'
    ],
    limits: {
      scheduledPosts: 120,
      threads: 9,
      analytics: true,
      automation: true,
      contentLibrary: true,
      aiGeneration: 5,
      aiImages: true,
      connectedAccounts: 1,
      support: 'priority',
      mediaTypes: ['text', 'images', 'gifs']
    }
  },
};

export default SUBSCRIPTION_PLANS;


