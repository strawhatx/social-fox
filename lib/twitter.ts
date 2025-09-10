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

export async function postTweetToTwitter(
  content: string, 
  bearer: string, 
  mediaIds?: string[], 
  communityId?: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  if (!bearer || !content?.trim()) {
    return { success: false, error: 'Missing token or content' };
  }

  try {
    const url = 'https://api.twitter.com/2/tweets';
    
    // Build the tweet payload
    const tweetPayload: any = {
      text: content.trim()
    };

    // Add media if provided
    if (mediaIds && mediaIds.length > 0) {
      tweetPayload.media = {
        media_ids: mediaIds
      };
    }

    // Add community if provided
    if (communityId) {
      tweetPayload.reply = {
        in_reply_to_tweet_id: communityId
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.detail || `Twitter API error: ${response.status}` 
      };
    }

    const data = await response.json();

    return { 
      success: true, 
      tweetId: data.data?.id 
    };

  } catch (error) {
    console.error('Error posting to Twitter:', error);
    
    return { 
      success: false, 
      error: 'Failed to post to Twitter' 
    };
  }
}

// Function to upload media to Twitter
export async function uploadMediaToTwitter(
  mediaUrl: string, 
  bearer: string
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  if (!bearer || !mediaUrl) {
    return { success: false, error: 'Missing token or media URL' };
  }

  try {
    // First, download the media
    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) {
      return { success: false, error: 'Failed to download media' };
    }

    const mediaBuffer = await mediaResponse.arrayBuffer();
    const mediaBlob = new Blob([mediaBuffer]);

    // Upload to Twitter
    const formData = new FormData();
    formData.append('media', mediaBlob);

    const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return { 
        success: false, 
        error: errorData.errors?.[0]?.message || 'Failed to upload media' 
      };
    }

    const uploadData = await uploadResponse.json();
    return { 
      success: true, 
      mediaId: uploadData.media_id_string 
    };
  } catch (error) {
    console.error('Error uploading media to Twitter:', error);
    return { 
      success: false, 
      error: 'Failed to upload media to Twitter' 
    };
  }
}

// Function to extract community ID from URL
export function extractCommunityIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Handle different Twitter URL formats
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
      /t\.co\/\w+/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting community ID:', error);
    return null;
  }
}


