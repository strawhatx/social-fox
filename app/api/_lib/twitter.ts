import { clerkClient } from '@clerk/nextjs/server';

// Attempts to read the user's OAuth access token for Twitter/X from Clerk
// Returns a bearer token string if available, otherwise null
export async function getUserTwitterBearerToken(userId: string): Promise<string | null> {
  const providers = ['oauth_twitter', 'oauth_x', 'twitter', 'x'];
  for (const provider of providers) {
    // Try modern Clerk SDK shape
    try {
      const anyUsers: any = (clerkClient as any).users;
      if (typeof anyUsers?.getUserOauthAccessToken === 'function') {
        const res = await anyUsers.getUserOauthAccessToken(userId, provider);
        const token = res?.data?.[0]?.token || res?.[0]?.token;
        if (token) return token as string;
      }
    } catch {}

    // Fallback attempt for alternative shapes
    try {
      const anyClient: any = clerkClient as any;
      const res = await anyClient.users?.getUserOauthAccessToken?.(userId, provider);
      const token = res?.data?.[0]?.token || res?.[0]?.token;
      if (token) return token as string;
    } catch {}
  }
  return null;
}


