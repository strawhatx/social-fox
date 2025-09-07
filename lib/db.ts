import { neon, neonConfig } from '@neondatabase/serverless';

// Cache connections across hot reloads in dev and across invocations in edge/serverless
neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing NEON_DATABASE_URL (or DATABASE_URL) environment variable');
}

export const sql = neon(databaseUrl);


// Resolve or create the app-level user UUID from a Clerk user ID
export async function ensureAppUserId(clerkUserId: string): Promise<string> {
  const rows = await sql`
    INSERT INTO public.users (clerk_user_id)
    VALUES (${clerkUserId})
    ON CONFLICT (clerk_user_id) DO UPDATE SET updated_at = now()
    RETURNING id`;
  const row = (rows as any[])?.[0];
  return String(row?.id);
}

// Try to resolve a user UUID from either a Clerk ID or a UUID string; if none, create from Clerk ID
export async function resolveUserUuid(userIdentifier: string): Promise<string | null> {
  // Try by Clerk ID first
  const byClerk = await sql`SELECT id FROM public.users WHERE clerk_user_id = ${userIdentifier} LIMIT 1`;
  if (Array.isArray(byClerk) && byClerk.length) {
    return String((byClerk as any[])[0].id);
  }
  // Try if the input is already a UUID string
  const byUuid = await sql`SELECT id FROM public.users WHERE id::text = ${userIdentifier} LIMIT 1`;
  if (Array.isArray(byUuid) && byUuid.length) {
    return String((byUuid as any[])[0].id);
  }
  // Fall back to creating from Clerk ID
  try {
    return await ensureAppUserId(userIdentifier);
  } catch {
    return null;
  }
}


