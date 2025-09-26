/*
  Netlify Scheduled Function: process-scheduled-posts
  - Claims due posts via internal scheduler API
  - Processes posts in parallel by calling the post API
  - Marks failures via scheduler fail action
*/

export const config = {
  schedule: '@every 5m', // change to '@hourly' for production
}

interface ClaimedPost {
  id: string
  clerkUserId: string | null
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

async function callJson(url: string, method: string, body: any, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers } as any,
    body: JSON.stringify(body),
  } as any)
  const text = await res.text()
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) }
  } catch {
    return { ok: res.ok, status: res.status, data: text }
  }
}

export default async () => {
  const baseUrl = getEnv('NEXT_PUBLIC_APP_URL')
  const apiKey = getEnv('SCHEDULER_SECRET')

  const headers = { 'scheduler-secret': apiKey }

  // 1) Claim due posts
  const claimUrl = `${baseUrl}/api/scheduler?limit=50`
  const claimResp = await callJson(claimUrl, 'GET', null, headers)
  if (!claimResp.ok) {
    console.error('Failed to claim posts', claimResp.status, claimResp.data)
    return
  }

  const claimed: ClaimedPost[] = Array.isArray(claimResp.data?.data) ? claimResp.data.data : []
  if (claimed.length === 0) {
    console.log('No due posts to process')
    return
  }

  // 2) Process in parallel
  const postUrl = `${baseUrl}/api/scheduler/post`
  await Promise.allSettled(
    claimed.map(async (item) => {
      try {
        const payload = { postId: item.id, clerkUserId: item.clerkUserId }
        const resp = await callJson(postUrl, 'POST', payload, headers)
        if (!resp.ok) {
          console.error('Post API failed for', item.id, resp.status, resp.data)
        }
      } catch (err: any) {
        console.error('Exception posting', item.id, err?.message)
      }
    })
  )
}


