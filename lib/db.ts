import { prisma } from '@/lib/prisma';
import { neon } from '@neondatabase/serverless';

// Create a database connection
const sql = neon(process.env.DATABASE_URL!);

// Export sql for use in other files
export { sql };



// Resolve or create the app-level user UUID from a Clerk user ID using Prisma
export async function ensureAppUserId(clerkUserId: string): Promise<string> {
  try {
    // Try to find the user first
    let user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (user) return user.id;
    
    // If not found, create the user with upsert to handle race conditions
    user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: { clerkUserId }
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


