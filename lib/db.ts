import { prisma } from '@/lib/db/prisma';

// Resolve or create the app-level user UUID from a Clerk user ID using Prisma
export async function ensureAppUserId(clerkUserId: string): Promise<string> {
  try {
    // Try to find the user first
    let user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (user) return user.id;
    
    // If not found, create the user with upsert to handle race conditions
    user = await prisma.user.upsert({
      where: { clerkUserId, updatedAt: new Date() },
      update: {},
      create: { clerkUserId, updatedAt: new Date(), subscriptionStatus: 'inactive'}
    });
    return user.id;
  } catch (error) {
    // If there's still a race condition, try to find the user again
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (user) return user.id;
    throw error;
  }
}


// Try to resolve a user UUID from either a Clerk ID or a UUID string; if none, create from Clerk ID (Prisma)
export async function resolveUserUuid(userIdentifier: string): Promise<string | null> {
  // Try by Clerk ID first
  let user = await prisma.user.findUnique({ where: { clerkUserId: userIdentifier } });
  if (user) return user.id;
  // Try if the input is already a UUID string
  user = await prisma.user.findUnique({ where: { id: userIdentifier } });
  if (user) return user.id;
  // Fall back to creating from Clerk ID
  try {
    return await ensureAppUserId(userIdentifier);
  } catch {
    return null;
  }
}

export async function resolveUserFromWebhookData(customerId: string, identifier: string, customData: any): Promise<Record<string, any> | null> {
  try {
    // First try to find user by existing subscriptionId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { subscriptionId: customerId },
          { subscriptionId: identifier }
        ]
      }
    });

    if (user) {
      console.log('Found user by existing subscriptionId:', user.id);
      return user;
    }

    // Try to find user by user ID from custom_data (most reliable)
    const userId = customData?.user_id || customData?.userId || customData?.clerk_user_id;
    if (userId) {
      console.log('Looking up user by user ID:', userId);
      
      const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
      if (user) {
        console.log('Found user by user ID:', user.id);
        return user;
      }
    }

    console.error('Could not resolve user by any method:', { userId });
    return null;
  } 
  catch (error) {
    console.error('Error resolving user from webhook data:', error);
    return null;
  }
}



