import fetch from 'node-fetch';

export async function fetchTwitterProfileByHandle(handle: string, bearer: string): Promise<any | null> {
  const url = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(handle)}?user.fields=profile_image_url,public_metrics,description`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTwitterPostsByUserId(twitterUserId: string, bearer: string): Promise<any | null> {
  const url = `https://api.twitter.com/2/users/${encodeURIComponent(twitterUserId)}/tweets?max_results=10&tweet.fields=created_at,public_metrics`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return null;
  return res.json();
}


