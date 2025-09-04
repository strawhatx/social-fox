import { createClerkClient } from '@clerk/clerk-sdk-node';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
const FALLBACK_TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN || '';
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

export async function getUserTwitterFromClerk(userId: string): Promise<{ handle: string | null; bearer: string | null }> {
  if (!CLERK_SECRET_KEY) return { handle: null, bearer: FALLBACK_TWITTER_BEARER || null };
  try {
    const user = await clerk.users.getUser(userId);
    const externalAccounts: any[] = (user as any).externalAccounts || (user as any).external_accounts || [];
    const tw = externalAccounts.find((acc: any) => ['oauth_twitter', 'oauth_x', 'twitter', 'x'].includes(acc.provider));
    const provider = tw?.provider || 'oauth_twitter';

    const tokens = await clerk.users.getUserOauthAccessToken(userId, provider as any);
    const bearer = (tokens as any)?.data?.[0]?.token ? String((tokens as any).data[0].token) : (FALLBACK_TWITTER_BEARER || null);
    const handle = tw?.username || tw?.external_username || null;
    return { handle, bearer };
  } catch {
    return { handle: null, bearer: FALLBACK_TWITTER_BEARER || null };
  }
}


