import { clerkClient } from '@clerk/nextjs/server';

// Attempts to read the user's OAuth access token for Twitter/X from Clerk
// Returns a bearer token string if available, otherwise null
export async function getUserTwitterBearerToken(userId: string): Promise<string | null> {
    try {
    const client = await clerkClient();
    const fullUser: any = await client.users.getUser(userId);
    const externalAccounts: any[] = (fullUser as any).externalAccounts || (fullUser as any).external_accounts || [];
    const twitterAccount = externalAccounts.find((acc: any) => ['oauth_twitter', 'oauth_x', 'twitter', 'x'].includes(acc.provider));
    
    const tokenData = await client.users?.getUserOauthAccessToken(userId, twitterAccount.provider)
    const token = tokenData?.data?.[0]?.token;
    
    return token ? String(token) : null;
  } catch {
    return null;
  }
}

// Best-effort fetch of an X (Twitter) Community by ID using a user bearer token
// Returns minimal metadata or null if unavailable
export async function fetchXCommunityById(communityId: string, bearer: string | null): Promise<{ name: string | null; description?: string | null } | null> {
  if (!bearer) return null;
  try {
    // Note: X's Communities API is not publicly documented; this is a best-effort attempt.
    // If endpoint changes or is unavailable, we gracefully return null.
    const url = `https://api.twitter.com/2/communities/${encodeURIComponent(communityId)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } as any });
    if (!('ok' in res) || !(res as any).ok) return null;
    const data = await (res as any).json();
    const name = data?.data?.name || data?.name || null;
    const description = data?.data?.description || data?.description || null;
    return { name, description };
  } catch {
    return null;
  }
}


