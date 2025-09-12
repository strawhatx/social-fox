import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    posts: number;
    ai_posts: number;
    ai_rewrites: number;
    starter_library_access: boolean;
    my_library_access: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  explore: {
    id: 'explore',
    name: 'Explore',
    price: 5,
    interval: 'month',
    features: [
      'Full access to Tweet Builder',
      'AI suggestions and templates',
      'Basic scheduling',
      'Hashtag suggestions',
      'Emoji picker'
    ],
    limits: {
      posts: 10,
      ai_posts: 10,
      ai_rewrites: 25,
      starter_library_access: true,
      my_library_access: false,
    }
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    price: 14,
    interval: 'month',
    features: [
      'Everything in Explore',
      'Unlimited posts',
      'Advanced AI features',
      'Bulk scheduling',
      'Priority support',
      'Advanced analytics'
    ],
    limits: {
      posts: 60, // -1 means unlimited
      ai_posts: 50,
      ai_rewrites: -1,
      starter_library_access: true,
      my_library_access: true,
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

export async function checkFeatureAccess(userId: string, feature: 'posts' | 'ai_posts' | 'ai_rewrites' | 'starter_library_access' | 'my_library_access'): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const { planDetails, status } = subscription;
  
  // Check if subscription is active
  if (status !== 'active' && planDetails.id !== 'free') {
    return false;
  }

  // Check feature limits
  const limit = planDetails.limits[feature];
  return limit === -1; // -1 means unlimited
}

export async function checkQuotaLimit(userId: string, feature: 'posts' | 'ai_posts' | 'ai_rewrites' | 'starter_library_access' | 'my_library_access'): Promise<{ allowed: boolean; used: number; limit: number }> {
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
  
  // Unlimited plan
  if (limit === -1) {
    return { allowed: true, used: 0, limit: -1 };
  }

  // Check current usage (you'll need to implement this based on your quota system)
  const used = await getCurrentUsage(userId, feature);
  
  return {
    allowed: used < limit,
    used,
    limit
  };
}

async function getCurrentUsage(userId: string, feature: 'posts' | 'ai_posts' | 'ai_rewrites' | 'starter_library_access' | 'my_library_access'): Promise<number> {
  const appUserId = await resolveUserUuid(userId);
  if (!appUserId) return 0;

  try {
    // For boolean features, return 0 (they're not counted)
    if (feature === 'starter_library_access' || feature === 'my_library_access') {
      return 0;
    }

    // Use the single quota table
    const quota = await prisma.userQuota.findFirst({
      where: {
        userId: appUserId,
        resetDate: { gt: new Date() }
      },
      select: {
        postsUsed: true,
        aiPostsUsed: true,
        aiRewritesUsed: true
      }
    });
    
    if (!quota) return 0;
    
    switch (feature) {
      case 'posts': return quota.postsUsed || 0;
      case 'ai_posts': return quota.aiPostsUsed || 0;
      case 'ai_rewrites': return quota.aiRewritesUsed || 0;
      default: return 0;
    }
  } catch (error) {
    console.error('Error getting current usage:', error);
    return 0;
  }
}

export async function initializeUserQuotas(userId: string, plan: string): Promise<boolean> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return false;

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) return false;

    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1); // First day of next month

    // Delete existing quota and create new one
    await prisma.userQuota.deleteMany({
      where: { userId: appUserId }
    });
    
    await prisma.userQuota.create({
      data: {
        userId: appUserId,
        postsLimit: planConfig.limits.posts,
        aiPostsLimit: planConfig.limits.ai_posts,
        aiRewritesLimit: planConfig.limits.ai_rewrites,
        resetDate: resetDate
      }
    });

    return true;
  } catch (error) {
    console.error('Error initializing user quotas:', error);
    return false;
  }
}

export async function incrementFeatureQuota(userId: string, feature: 'posts' | 'ai_posts' | 'ai_rewrites'): Promise<boolean> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return false;

    // Get current quota status first
    const quotaStatus = await getFeatureQuotaStatus(userId, feature);
    if (!quotaStatus || !quotaStatus.allowed) {
      return false;
    }

    // Increment the specific feature
    let result;
    switch (feature) {
      case 'posts':
        result = await prisma.userQuota.updateMany({
          where: {
            userId: appUserId,
            resetDate: { gt: new Date() },
            postsUsed: { lt: prisma.userQuota.fields.postsLimit }
          },
          data: {
            postsUsed: { increment: 1 }
          }
        });
        break;
      case 'ai_posts':
        result = await prisma.userQuota.updateMany({
          where: {
            userId: appUserId,
            resetDate: { gt: new Date() },
            aiPostsUsed: { lt: prisma.userQuota.fields.aiPostsLimit }
          },
          data: {
            aiPostsUsed: { increment: 1 }
          }
        });
        break;
      case 'ai_rewrites':
        result = await prisma.userQuota.updateMany({
          where: {
            userId: appUserId,
            resetDate: { gt: new Date() },
            OR: [
              { aiRewritesLimit: -1 },
              { aiRewritesUsed: { lt: prisma.userQuota.fields.aiRewritesLimit } }
            ]
          },
          data: {
            aiRewritesUsed: { increment: 1 }
          }
        });
        break;
      default:
        return false;
    }

    return result.count > 0;
  } catch (error) {
    console.error('Error incrementing feature quota:', error);
    return false;
  }
}

export async function getFeatureQuotaStatus(userId: string, feature: 'posts' | 'ai_posts' | 'ai_rewrites'): Promise<{ used: number; limit: number; allowed: boolean } | null> {
  try {
    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return null;

    const quota = await prisma.userQuota.findFirst({
      where: {
        userId: appUserId,
        resetDate: { gt: new Date() }
      },
      select: {
        postsUsed: true,
        postsLimit: true,
        aiPostsUsed: true,
        aiPostsLimit: true,
        aiRewritesUsed: true,
        aiRewritesLimit: true
      }
    });
    
    if (!quota) return null;
    
    let used, limit, allowed;
    
    switch (feature) {
      case 'posts':
        used = quota.postsUsed || 0;
        limit = quota.postsLimit || 0;
        allowed = used < limit;
        break;
      case 'ai_posts':
        used = quota.aiPostsUsed || 0;
        limit = quota.aiPostsLimit || 0;
        allowed = used < limit;
        break;
      case 'ai_rewrites':
        used = quota.aiRewritesUsed || 0;
        limit = quota.aiRewritesLimit || 0;
        allowed = limit === -1 || used < limit; // -1 means unlimited
        break;
      default:
        return null;
    }

    return { used, limit, allowed };
  } catch (error) {
    console.error('Error getting feature quota status:', error);
    return null;
  }
}

export function getCheckoutUrl(productId: string, customerId?: string): string {
  const baseUrl = `https://socialfox.lemonsqueezy.com/checkout/buy/${productId}`;
  
  if (customerId) {
    return `${baseUrl}?checkout[custom][customer_id]=${customerId}`;
  }
  
  return baseUrl;
}

export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/customers/portal', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEMON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer portal');
    }

    const data = await response.json();
    return data.data.attributes.url;
  } catch (error) {
    console.error('Error creating customer portal:', error);
    return null;
  }
}
