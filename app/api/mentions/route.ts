// Mentions API
// POST /api/mentions
// - Primary: Use Clerk OAuth token to call Twitter v2 for the signed-in user's
//   following; cache server-side; rank against content
// - Fallbacks: OpenAI → Gemini → simple extraction from content
// Notes:
// - Avoids overuse with a 10-minute server cache of the following list
// - Client components also apply in-page caching for repeated clicks
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { currentUser, clerkClient } from "@clerk/nextjs/server";

// Request payload for POST /api/mentions
type MentionsRequestBody = {
  content: string;
  limit?: number;
};

// Normalizes strings to valid @handles
function normalizeHandle(handle: string): string {
  let cleaned = handle.trim();

  if (!cleaned) return "";
  if (!cleaned.startsWith("@")) cleaned = `@${cleaned}`;

  cleaned = cleaned.replace(/[^@a-zA-Z0-9_]/g, "");

  // Twitter handles are 2-15 chars (excluding @)
  const name = cleaned.slice(1);

  if (name.length < 2 || name.length > 15) return "";
  return `@${name}`;
}

// Extracts @handles from freeform text (LLM fallback)
function extractHandlesFromText(text: string, limit: number): string[] {
  const matches = text.match(/@[a-zA-Z0-9_]{2,15}/g) || [];
  const unique = Array.from(new Set(matches.map(normalizeHandle)));

  return unique.slice(0, Math.max(1, Math.min(25, limit)));
}

// Calls OpenAI to propose @handles as a JSON array
async function generateWithOpenAI(input: MentionsRequestBody): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const prompt = `
  You are a social media strategist. From the tweet content below, propose ${limit} relevant Twitter handles to mention that are likely to engage or be contextually appropriate. Only return a JSON array of strings with @handles. Do not include any text before or after the JSON. Ensure each handle appears valid (2-15 chars, letters, numbers, underscore). If unsure, keep the list short.

  Tweet content: ${input.content}

  Rules:
  - Only return a JSON array of handles like ["@vercel", "@nextjs"].
  - 2-15 chars per handle (excluding @).
  - Prefer high-signal, relevant accounts.
  - Avoid duplicates.`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You output only a JSON array when asked for handles." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content || "";
    
    try {
      const parsed = JSON.parse(text);
      
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((t: unknown) => (typeof t === "string" ? normalizeHandle(t) : ""))
          .filter(Boolean);
        return Array.from(new Set(cleaned)).slice(0, limit);
      }
    } catch {
      const extracted = extractHandlesFromText(text, limit);
      if (extracted.length) return extracted;
    }
    return null;
  } catch {
    return null;
  }
}

// Calls Gemini to propose @handles as a JSON array
async function generateWithGemini(input: MentionsRequestBody): Promise<string[] | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const prompt = `You are a social media strategist. From the tweet content below, propose ${limit} relevant Twitter handles to mention that are likely to engage or be contextually appropriate. Only return a JSON array of strings with @handles. Do not include any text before or after the JSON. Ensure each handle appears valid (2-15 chars, letters, numbers, underscore). If unsure, keep the list short.

  Tweet content: ${input.content}

  Rules:
  - Only return a JSON array of handles like ["@vercel", "@nextjs"].
  - 2-15 chars per handle (excluding @).
  - Prefer high-signal, relevant accounts.
  - Avoid duplicates.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      }
    );

    if (!resp.ok) return null;

    const data = await resp.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((t: unknown) => (typeof t === "string" ? normalizeHandle(t) : ""))
          .filter(Boolean);
        return Array.from(new Set(cleaned)).slice(0, limit);
      }
    } catch {
      const extracted = extractHandlesFromText(text, limit);
      if (extracted.length) return extracted;
    }
    return null;
  } catch {
    return null;
  }
}

// Simple in-memory cache for following list per access token (masked)
// In-memory cache per access token (masked) → following handles
const twitterFollowingCache: Map<string, { fetchedAt: number; handles: string[] }> = new Map();
const FOLLOWING_TTL_MS = 10 * 60 * 1000; // 10 minutes

function maskToken(token: string): string {
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

// Very simple scoring: prefer shorter handles and those whose text appears in content
function rankByContentRelevance(handles: string[], content: string, limit: number): string[] {
  const text = content.toLowerCase();
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3);
  const counts = new Map<string, number>();
  for (const h of handles) {
    // basic heuristic: prefer shorter, well-known-like handles; boost if their name appears in text
    const base = 10 - Math.min(9, Math.max(0, h.length - 5));
    let score = base;
    for (const w of words) {
      if (h.toLowerCase().includes(w)) score += 2;
    }
    counts.set(h, score);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([h]) => h)
    .slice(0, limit);
}

// Fetches following via Twitter v2 using OAuth token and ranks the results
async function fetchAndRankTwitterFollowing(accessToken: string, content: string, limit: number): Promise<string[]> {
  const cacheKey = maskToken(accessToken);
  const cached = twitterFollowingCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < FOLLOWING_TTL_MS) {
    return rankByContentRelevance(cached.handles, content, limit);
  }

  // 1) Resolve user id from token
  const meResp = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!meResp.ok) return [];
  const meData = await meResp.json();
  const userId = meData?.data?.id as string | undefined;
  
  if (!userId) return [];

  // 2) Fetch following list (paginated; limit to first page to limit usage)
  const followingUrl = new URL(`https://api.twitter.com/2/users/${userId}/following`);
  followingUrl.searchParams.set("max_results", "100");
  followingUrl.searchParams.set("user.fields", "username,verified,public_metrics,description");
  
  const followingResp = await fetch(followingUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!followingResp.ok) return [];
  
  const followingData = await followingResp.json();
  const users: Array<{ username: string }> = followingData?.data || [];
  const handles = Array.from(new Set(users.map(u => normalizeHandle(u.username)))).filter(Boolean);

  twitterFollowingCache.set(cacheKey, { fetchedAt: now, handles });
  return rankByContentRelevance(handles, content, limit);
}

// POST handler: Tries Twitter via Clerk token; falls back to LLMs
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MentionsRequestBody;
    const content = (body.content || "").trim();
    const limitParam = Number.isFinite(body.limit as number) ? (body.limit as number) : 10;
    const limit = Math.min(Math.max(limitParam, 1), 25);
    
    if (!content) {
      return NextResponse.json({ error: "Missing required 'content' in body" }, { status: 400 });
    }

    // Try Twitter via Clerk OAuth first
    const user = await currentUser();
    let twitterHandles: string[] = [];
    let source: "twitter" | "openai" | "gemini" | "fallback" = "twitter";

    if (user?.id) {
      try {
        const client = await clerkClient();
        const fullUser: any = await client.users.getUser(user.id);
        const externalAccounts: any[] = (fullUser as any).externalAccounts || (fullUser as any).external_accounts || [];
        const twitterAccount = externalAccounts.find((acc: any) =>
          ["oauth_twitter", "oauth_x", "twitter", "x"].includes(acc.provider)
        );

        // Attempt to fetch an OAuth access token from Clerk
        let accessToken: string | null = null;
        if (twitterAccount) {
          const provider = twitterAccount.provider;
          try {
            const tokens = await client.users.getUserOauthAccessToken(user.id, provider);
            // tokens is a paginated response; extract first token from data
            accessToken = (tokens as any)?.data?.[0]?.token || null;
          } catch {}
        }

        if (accessToken) {
          const ranked = await fetchAndRankTwitterFollowing(accessToken, content, limit);
          twitterHandles = ranked;
        }
      } catch {
        // ignore and fall back
      }
    }

    if (!twitterHandles.length) {
      // Fall back to LLM-based suggestions when Twitter token unavailable
      let handles = await generateWithOpenAI({ content, limit });
      source = "openai";
      
      if (!handles || handles.length === 0) {
        handles = await generateWithGemini({ content, limit });
        source = "gemini";
      }

      if (!handles || handles.length === 0) {
        handles = extractHandlesFromText(content, limit);
        source = "fallback";
      }
      
      return NextResponse.json({ source, handles });
    }

    return NextResponse.json({ source, handles: twitterHandles });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


