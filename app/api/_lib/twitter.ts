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


