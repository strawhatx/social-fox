import { clerkClient } from '@clerk/nextjs/server';

export async function getUserTwitterBearerToken(userId: string): Promise<string | null> {
  try {
    if (!userId) {
      return null
    }

    // Try multiple provider slugs to be robust across Clerk/X naming variants
    const providerSlugs = ['oauth_twitter', 'x', 'twitter', 'oauth_x'] as const

    // Support both shapes: object client (with .users) and function that returns a client
    const clientAny = (typeof (clerkClient as any) === 'function')
      ? await (clerkClient as any)()
      : (clerkClient as any)

    // Collect tokens from all configured provider slugs
    const tokenList: any[] = []
    for (const provider of providerSlugs) {
      try {
        const resp = await clientAny.users.getUserOauthAccessToken(userId, provider as any)
        if (resp && Array.isArray((resp as any).data)) {
          tokenList.push(...(resp as any).data)
        }
      } catch {
        // ignore and keep trying other providers
      }
    }

    // Prefer OAuth2 user-context tokens; exclude OAuth1 (tokenSecret) and app-like bearer; ensure token belongs to a user session
    const oauth2UserToken = tokenList.find((t: any) => {
      const token: string = String(t?.token || '')
      const scopes: string[] = Array.isArray(t?.scopes) ? t.scopes : []
      const looksLikeAppToken = token.startsWith('AAAAAAAA')
      const isOAuth1 = !!t?.tokenSecret
      const hasUserScopes = scopes.some((s) => s === 'tweet.read' || s === 'users.read' || s === 'offline.access')
      const hasUserContext = !!t?.externalAccountId || !!t?.sessionId || !!t?.tokenType
      return !!token && hasUserScopes && hasUserContext && !looksLikeAppToken && !isOAuth1
    })

    const accessToken = (oauth2UserToken as any)?.token || ''
    if (!accessToken) {
      return null
    }
    // Verify token is truly user-context by calling a user-scoped endpoint
    const isUser = await isUserContextTwitterToken(accessToken)
    if (!isUser) {
      return null
    }
    return accessToken
  } catch {
    return null;
  }
}

export function getAppTwitterBearerToken(): string | null {
  return process.env.TWITTER_APP_ACCESS_TOKEN || null;
}

export async function fetchTwitterUserByUsername(username: string, bearer: string | null): Promise<any | null> {
  if (!bearer) return null;
  try {
    const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=profile_image_url,public_metrics,description`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } as any });
    if (!('ok' in res) || !(res as any).ok) return null;
    const data = await (res as any).json();
    return data?.data || null;
  } catch {
    return null;
  }
}

export async function fetchUserTweetsById(userId: string, bearer: string | null, max: number = 5): Promise<any[]> {
  if (!bearer) return [];
  try {
    const url = `https://api.twitter.com/2/users/${encodeURIComponent(userId)}/tweets?max_results=${Math.min(Math.max(max, 1), 100)}&tweet.fields=created_at,public_metrics`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } as any });
    if (!('ok' in res) || !(res as any).ok) return [];
    const data = await (res as any).json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

export async function isUserContextTwitterToken(bearer: string): Promise<boolean> {
  if (!bearer) return false
  try {
    const url = 'https://api.twitter.com/2/users/me'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } as any })
    const result = await res.json();
    console.log(result);
    return !!(('ok' in res) && (res as any).ok)
  } catch {
    return false
  }
}


