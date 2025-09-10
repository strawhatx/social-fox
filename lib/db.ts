import { prisma } from '@/lib/prisma';



// Resolve or create the app-level user UUID from a Clerk user ID using Prisma
export async function ensureAppUserId(clerkUserId: string): Promise<string> {
  // Try to find the user first
  let user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (user) return user.id;
  // If not found, create the user
  user = await prisma.user.create({ data: { clerkUserId } });
  return user.id;
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


