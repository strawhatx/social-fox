import { prisma } from '@/lib/prisma';
import { planLimits } from '@/lib/features';

export interface UsagePeriod {
  start: Date;
  end: Date;
}

export interface UserUsage {
  userId: string;
  feature: string;
  used: number;
  limit: number;
  period: UsagePeriod;
}

// Get current billing period (monthly)
export function getCurrentBillingPeriod(): UsagePeriod {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { start, end };
}

// Get user's current plan from database
export async function getUserPlan(userId: string): Promise<'explore' | 'creator' | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user?.subscriptionStatus === 'active' && user.plan) {
      // Map database plan to our plan names
      const planMap: Record<string, 'explore' | 'creator'> = {
        'explore': 'explore',
        'creator': 'creator'
      };
      return planMap[user.plan] || null;
    }
    
    return null; // No active subscription
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
}

// Get user's current usage for a feature
export async function getUserUsage(
  userId: string, 
  feature: string
): Promise<UserUsage | null> {
  try {
    const plan = await getUserPlan(userId);
    
    // If no active plan, return null (no access)
    if (!plan) {
      return null;
    }
    
    const period = getCurrentBillingPeriod();
    const limit = (planLimits[plan] as any)[feature] || 0;

    // Get or create usage record for current period
    let usage = await prisma.userUsage.findUnique({
      where: {
        userId_feature_periodStart_periodEnd: {
          userId,
          feature,
          periodStart: period.start,
          periodEnd: period.end
        }
      }
    });

    // Create usage record if it doesn't exist
    if (!usage) {
      usage = await prisma.userUsage.create({
        data: {
          userId,
          feature,
          used: 0,
          periodStart: period.start,
          periodEnd: period.end
        }
      });
    }

    return {
      userId,
      feature,
      used: usage.used,
      limit: limit === Infinity ? Number.MAX_SAFE_INTEGER : limit,
      period
    };
  } catch (error) {
    console.error('Error getting user usage:', error);
    return null;
  }
}

// Check if user can use a feature
export async function canUseFeature(
  userId: string, 
  feature: string
): Promise<{ canUse: boolean; reason?: string; usage?: UserUsage }> {
  try {
    const usage = await getUserUsage(userId, feature);
    
    if (!usage) {
      return { canUse: false, reason: 'Unable to check usage' };
    }

    if (usage.used >= usage.limit) {
      return { 
        canUse: false, 
        reason: 'Usage limit reached for this billing period',
        usage 
      };
    }

    return { canUse: true, usage };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return { canUse: false, reason: 'Error checking usage' };
  }
}

// Increment feature usage
export async function incrementFeatureUsage(
  userId: string, 
  feature: string
): Promise<{ success: boolean; error?: string; usage?: UserUsage }> {
  try {
    // Check if user can use the feature first
    const access = await canUseFeature(userId, feature);
    
    if (!access.canUse) {
      return { success: false, error: access.reason };
    }

    const period = getCurrentBillingPeriod();

    // Increment usage
    const updatedUsage = await prisma.userUsage.upsert({
      where: {
        userId_feature_periodStart_periodEnd: {
          userId,
          feature,
          periodStart: period.start,
          periodEnd: period.end
        }
      },
      update: {
        used: { increment: 1 }
      },
      create: {
        userId,
        feature,
        used: 1,
        periodStart: period.start,
        periodEnd: period.end
      }
    });

    const plan = await getUserPlan(userId);
    const limit = plan ? (planLimits[plan] as any)[feature] || 0 : 0;

    return {
      success: true,
      usage: {
        userId,
        feature,
        used: updatedUsage.used,
        limit: limit === Infinity ? Number.MAX_SAFE_INTEGER : limit,
        period
      }
    };
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return { success: false, error: 'Database error' };
  }
}

// Get all user usage for dashboard
export async function getAllUserUsage(userId: string): Promise<UserUsage[] | null> {
  try {
    const plan = await getUserPlan(userId);
    
    // If no active plan, return null (no access)
    if (!plan) {
      return null;
    }
    
    const period = getCurrentBillingPeriod();
    const features = Object.keys(planLimits.explore);

    const usageRecords = await prisma.userUsage.findMany({
      where: {
        userId,
        periodStart: period.start,
        periodEnd: period.end
      }
    });

    // Create usage objects for all features
    const allUsage: UserUsage[] = features.map(feature => {
      const record = usageRecords.find((r: any) => r.feature === feature);
      const limit = plan ? (planLimits[plan] as any)[feature] || 0 : 0;

      return {
        userId,
        feature,
        used: record?.used || 0,
        limit: limit === Infinity ? Number.MAX_SAFE_INTEGER : limit,
        period
      };
    });

    return allUsage;
  } catch (error) {
    console.error('Error getting all user usage:', error);
    return null;
  }
}

// Reset usage for a new billing period (for cron jobs)
export async function resetUsageForNewPeriod(userId: string): Promise<void> {
  try {
    const period = getCurrentBillingPeriod();
    
    // This would typically be called by a cron job
    // For now, we'll just ensure usage records exist for the current period
    const features = Object.keys(planLimits.explore);
    
    for (const feature of features) {
      await prisma.userUsage.upsert({
        where: {
          userId_feature_periodStart_periodEnd: {
            userId,
            feature,
            periodStart: period.start,
            periodEnd: period.end
          }
        },
        update: {},
        create: {
          userId,
          feature,
          used: 0,
          periodStart: period.start,
          periodEnd: period.end
        }
      });
    }
  } catch (error) {
    console.error('Error resetting usage for new period:', error);
  }
}
