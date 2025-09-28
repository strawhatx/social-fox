import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { QUOTA_FEATURES } from '@/lib/features';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  popular: boolean;
  interval: 'month' | 'year';
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
    features: [
      'AI-powered social media posts',
      'Basic scheduling',
      'Template library access',
      'One-time 30 AI drafts',
      '10 scheduled posts per month'
    ],
    limits: {
      copilotDrafts: 30,
      scheduledPosts: 10,
      starterTemplates: true,
      customTemplates: false
    }
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 29,
    popular: true,
    interval: 'month',
    features: [
      'Everything in Explore',
      'Advanced AI features',
      'Custom template creation',
      '150 AI drafts per month',
      '100 scheduled posts per month',
      'Priority support'
    ],
    limits: {
      copilotDrafts: 150,
      scheduledPosts: 100,
      starterTemplates: true,
      customTemplates: true
    }
  }
};

export async function getUserSubscription(userId: string) {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return null;

    const user = await prisma.user.findUnique({
      where: { id: appUserId },
      select: {
        plan: true,
        subscriptionStatus: true,
        subscriptionId: true,
        subscriptionExpiry: true
      }
    });

    if (!user || !user.plan) return null;

    return {
      plan: user.plan,
      status: user.subscriptionStatus || 'inactive',
      subscriptionId: user.subscriptionId,
      expiry: user.subscriptionExpiry,
      planDetails: SUBSCRIPTION_PLANS[user.plan]
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const { planDetails, status } = subscription;
  
  // Check if subscription is active
  if (status !== 'active') {
    return false;
  }

  // Check if feature exists in plan
  const limit = planDetails.limits[feature];
  if (typeof limit === 'boolean') {
    return limit;
  }
  
  return typeof limit === 'number' && limit > 0;
}

export async function checkQuotaLimit(userId: string, feature: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, used: 0, limit: 0 };
  }

  const { planDetails, status } = subscription;
  const limit = planDetails.limits[feature];
  
  // For boolean features (access), return based on the boolean value
  if (typeof limit === 'boolean') {
    return { allowed: limit, used: limit ? 1 : 0, limit: limit ? 1 : 0 };
  }
  
  // For numeric limits, check current usage
  const used = await getCurrentUsage(userId, feature);
  
  return {
    allowed: used < (limit as number),
    used,
    limit: limit as number
  };
}

async function getCurrentUsage(userId: string, feature: string): Promise<number> {
  const appUserId = await resolveUserUuid(userId);
  if (!appUserId) return 0;

  try {
    // Get current billing period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Use the new UserUsage table
    const usage = await prisma.userUsage.findUnique({
      where: {
        userId_feature_periodStart_periodEnd: {
          userId: appUserId,
          feature,
          periodStart,
          periodEnd
        }
      }
    });
    
    return usage?.used || 0;
  } catch (error) {
    console.error('Error getting current usage:', error);
    return 0;
  }
}

// Public helper to get current billing period
export function getCurrentBillingPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Return usage details for a single feature
export async function getUserUsage(userId: string, feature: string): Promise<{ userId: string; feature: string; used: number; limit: number; period: { start: Date; end: Date } } | null> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return null;

  const period = getCurrentBillingPeriod();
  const limitConfig = subscription.planDetails.limits[feature];
  const limit = typeof limitConfig === 'number' ? limitConfig : (limitConfig ? 1 : 0);
  const used = await getCurrentUsage(userId, feature);
  return { userId, feature, used, limit, period };
}

// Return usage for all quota features
export async function getAllUserUsage(userId: string): Promise<Array<{ userId: string; feature: string; used: number; limit: number; period: { start: Date; end: Date } }> | null> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return null;

  const period = getCurrentBillingPeriod();
  const features = Object.keys(QUOTA_FEATURES);
  const usageResults: Array<{ userId: string; feature: string; used: number; limit: number; period: { start: Date; end: Date } }> = [];
  for (const feature of features) {
    const limit = subscription.planDetails.limits[feature] as number | boolean;
    const numericLimit = typeof limit === 'number' ? limit : (limit ? 1 : 0);
    const used = await getCurrentUsage(userId, feature);
    usageResults.push({ userId, feature, used, limit: numericLimit, period });
  }
  return usageResults;
}

// Detailed feature access helper compatible with previous API
export async function canUseFeatureDetailed(userId: string, feature: string): Promise<{ canUse: boolean; reason?: string; usage?: { userId: string; feature: string; used: number; limit: number; period: { start: Date; end: Date } } }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { canUse: false, reason: 'Unable to check usage' };
  }
  if (subscription.status !== 'active') {
    return { canUse: false, reason: 'Subscription inactive' };
  }
  const status = await getFeatureQuotaStatus(userId, feature);
  if (!status) {
    return { canUse: false, reason: 'Feature not found' };
  }
  const usage = await getUserUsage(userId, feature);
  if (!status.allowed) {
    return { canUse: false, reason: 'Usage limit reached for this billing period', usage: usage || undefined };
  }
  return { canUse: true, usage: usage || undefined };
}

export async function initializeUserQuotas(userId: string, plan: string): Promise<boolean> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return false;

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) return false;

    // Get current billing period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Initialize usage records for all features in the plan
    const features = Object.keys(planConfig.limits);
    
    for (const feature of features) {
      await prisma.userUsage.upsert({
        where: {
          userId_feature_periodStart_periodEnd: {
            userId: appUserId,
            feature,
            periodStart,
            periodEnd
          }
        },
        update: {},
        create: {
          userId: appUserId,
          feature,
          used: 0,
          periodStart,
          periodEnd
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing user quotas:', error);
    return false;
  }
}

export async function incrementFeatureQuota(userId: string, feature: string): Promise<boolean> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return false;

    // Get current quota status first
    const quotaStatus = await getFeatureQuotaStatus(userId, feature);
    if (!quotaStatus || !quotaStatus.allowed) {
      return false;
    }

    // Get current billing period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Increment usage in the UserUsage table
    await prisma.userUsage.upsert({
      where: {
        userId_feature_periodStart_periodEnd: {
          userId: appUserId,
          feature,
          periodStart,
          periodEnd
        }
      },
      update: {
        used: { increment: 1 }
      },
      create: {
        userId: appUserId,
        feature,
        used: 1,
        periodStart,
        periodEnd
      }
    });

    return true;
  } catch (error) {
    console.error('Error incrementing feature quota:', error);
    return false;
  }
}

export async function getFeatureQuotaStatus(userId: string, feature: string): Promise<{ used: number; limit: number; allowed: boolean } | null> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return null;

    // Get subscription to check limits
    const subscription = await getUserSubscription(userId);
    if (!subscription) return null;

    const limit = subscription.planDetails.limits[feature];
    
    // For boolean features, return based on the boolean value
    if (typeof limit === 'boolean') {
      return { used: limit ? 1 : 0, limit: limit ? 1 : 0, allowed: limit };
    }

    // Get current usage
    const used = await getCurrentUsage(userId, feature);
    const allowed = used < (limit as number);

    return { used, limit: limit as number, allowed };
  } catch (error) {
    console.error('Error getting feature quota status:', error);
    return null;
  }
}

