import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { canUseFeatureDetailed, incrementFeatureQuota } from './subscriptions';
import { isAdmin } from '@/lib/admin';

export interface QuotaCheckResult {
  canProceed: boolean;
  error?: string;
  statusCode?: number;
  usage?: any;
}

// Middleware function to check quota before API actions
export async function checkQuota(
  request: NextRequest,
  feature: string
): Promise<QuotaCheckResult> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        canProceed: false,
        error: 'Unauthorized',
        statusCode: 401
      };
    }

    // Admin bypass
    if (isAdmin(userId)) {
      return {
        canProceed: true,
        usage: { userId, feature, used: 0, limit: Number.MAX_SAFE_INTEGER }
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return {
        canProceed: false,
        error: 'User not found',
        statusCode: 404
      };
    }

    // Check if user can use the feature
    const access = await canUseFeatureDetailed(user.id, feature);
    
    if (!access.canUse) {
      return {
        canProceed: false,
        error: access.reason || 'Quota exceeded',
        statusCode: 402,
        usage: access.usage
      };
    }

    return {
      canProceed: true,
      usage: access.usage
    };
  } catch (error) {
    console.error('Error checking quota:', error);
    return {
      canProceed: false,
      error: 'Internal server error',
      statusCode: 500
    };
  }
}

// Middleware function to increment usage after successful API action
export async function incrementUsage(
  userId: string,
  feature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = await incrementFeatureQuota(userId, feature);
    return ok ? { success: true } : { success: false, error: 'Failed to update usage' };
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return { success: false, error: 'Failed to update usage' };
  }
}

// Higher-order function to wrap API routes with quota checking
export function withQuotaCheck(
  feature: string,
  handler: (request: NextRequest, context: any, user: any, usage: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    // Check quota before proceeding
    const quotaCheck = await checkQuota(request, feature);
    
    if (!quotaCheck.canProceed) {
      return NextResponse.json(
        { 
          error: quotaCheck.error,
          usage: quotaCheck.usage 
        }, 
        { status: quotaCheck.statusCode || 402 }
      );
    }

    // Get user info for the handler
    const { userId } = await auth();
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId! }
    });

    try {
      // Execute the original handler
      const response = await handler(request, context, user, quotaCheck.usage);
      
      // If the response is successful (2xx), increment usage
      if (response.status >= 200 && response.status < 300) {
        await incrementFeatureQuota(user!.clerkUserId, feature);
      }
      
      return response;
    } catch (error) {
      console.error('Error in quota-protected handler:', error);
      return NextResponse.json(
        { error: 'Internal server error' }, 
        { status: 500 }
      );
    }
  };
}

// Utility function to create quota error response
export function createQuotaErrorResponse(
  message: string, 
  usage?: any, 
  statusCode: number = 402
): NextResponse {
  const res = NextResponse.json(
    {
      error: message,
      usage,
      upgradeRequired: true,
    },
    { status: statusCode }
  );
  res.headers.set('x-upgrade-required', 'true');
  return res;
}

// Utility function to get user from request
export async function getUserFromRequest(): Promise<{ user: any; error?: string }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { user: null, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return { user: null, error: 'Internal server error' };
  }
}
