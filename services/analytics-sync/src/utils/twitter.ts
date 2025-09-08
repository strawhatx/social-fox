import fetch from 'node-fetch';

export async function fetchTwitterProfileByHandle(handle: string, bearer: string): Promise<any | null> {
  const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=profile_image_url,public_metrics,description`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTwitterProfileByUserId(twitterUserId: string, bearer: string): Promise<any | null> {
  const url = `https://api.twitter.com/2/users/${encodeURIComponent(twitterUserId)}?user.fields=profile_image_url,public_metrics,description`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTwitterPostsByUserId(
  twitterUserId: string,
  bearer: string,
  sinceId?: string | null,
  maxResults: number = 20
): Promise<any | null> {
  const clamped = Math.max(5, Math.min(100, maxResults || 20));
  let url = `https://api.twitter.com/2/users/${encodeURIComponent(twitterUserId)}/tweets?max_results=${clamped}&tweet.fields=created_at,public_metrics`;
  if (sinceId) {
    url += `&since_id=${encodeURIComponent(sinceId)}`;
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return null;
  return res.json();
}