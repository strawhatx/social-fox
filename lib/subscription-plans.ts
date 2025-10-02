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
  explore: {
    id: 'explore',
    name: 'Explore',
    price: 9,
    popular: false,
    interval: 'month',
    period: 'month',
    action: 'explore',
    buttonText: 'Upgrade to Explore',
    features: [
      '30 drafts(10 ideas x 3  variations)',
      '10 scheduled posts',
      'Template library access',
      '1 X account',
      'Basic support'
    ],
    limits: {
      copilotDrafts: 10,
      scheduledPosts: 10,
      starterTemplates: true,
      customTemplates: true
    }
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 29,
    popular: true,
    interval: 'month',
    period: 'month',
    action: 'creator',
    buttonText: 'Upgrade to Creator',
    features: [
        '120 drafts(40 ideas x 3 variations)',
        '75 scheduled posts',
        'Template library access',
        '1 X account',
        'Priority support'
    ],
    limits: {
      copilotDrafts: 40,
      scheduledPosts: 75,
      starterTemplates: true,
      customTemplates: true
    }
  }
};

export default SUBSCRIPTION_PLANS;


