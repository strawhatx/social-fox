import OpenAI from 'openai';
import { currentUser, clerkClient } from '@clerk/nextjs/server';

const DEFAULT_FALLBACKS: Record<string, string[]> = {
  default: [
    '#dev',
    '#coding',
    '#100DaysOfCode',
    '#webdev',
    '#javascript',
    '#typescript',
    '#reactjs',
    '#frontend',
    '#software',
    '#programming',
  ],
};

export type HashtagResult = { source: 'openai' | 'gemini' | 'fallback'; hashtags: string[] };

export async function getHashtags(content: string, limitParam = 10): Promise<HashtagResult> {
  const limit = Math.min(Math.max(limitParam, 1), 25);
  const twitterHandle = await resolveTwitterHandleViaClerk();

  let hashtags = await generateWithOpenAI({ content, twitterHandle, limit });
  let source: HashtagResult['source'] = 'openai';

  if (!hashtags || hashtags.length === 0) {
    hashtags = await generateWithGemini({ content, twitterHandle, limit });
    source = 'gemini';
  }

  if (!hashtags || hashtags.length === 0) {
    const words = content
      .toLowerCase()
      .replace(/[#@]/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const seed = words.pop() || 'developer';
    hashtags = buildFallbackHashtags(seed, limit);
    source = 'fallback';
  }

  return { source, hashtags };
}

// Helpers
function buildFallbackHashtags(query: string, limit: number): string[] {
  const seed = query.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const seeded: string[] = [];
  if (seed) {
    const base = `#${seed}`;
    const variants = [base, `#${seed}tips`, `#${seed}dev`, `#learn${seed}`, `#${seed}community`];
    seeded.push(...variants);
  }
  const pool = [...seeded, ...DEFAULT_FALLBACKS.default];
  const unique = Array.from(new Set(pool));
  return unique.slice(0, Math.max(1, Math.min(25, limit)));
}

function normalizeHashtag(tag: string): string {
  let cleaned = tag.trim();
  if (!cleaned) return '';
  if (!cleaned.startsWith('#')) cleaned = `#${cleaned}`;
  cleaned = cleaned.replace(/[^#a-zA-Z0-9_]/g, '');
  return cleaned;
}

function extractHashtagsFromText(text: string, limit: number): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]{2,}/g) || [];
  const unique = Array.from(new Set(matches.map(normalizeHashtag)));
  return unique.slice(0, Math.max(1, Math.min(25, limit)));
}

type HashtagRequestBody = { content: string; twitterHandle?: string | null; limit?: number };

async function generateWithOpenAI(input: HashtagRequestBody): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const handleText = input.twitterHandle ? `Twitter handle: @${input.twitterHandle}` : 'Twitter handle: (not provided)';
  const prompt = `You are an expert social media strategist.
Generate ${limit} highly relevant and trending hashtags for the following tweet content and account context, prioritizing reach and authenticity. Only return a JSON array of strings. Do not include any text before or after the JSON.

${handleText}
Tweet content: ${input.content}

Rules:
- Only return a JSON array of hashtags like ["#webdev", "#javascript"].
- Do not include duplicates.
- Prefer English.
- Keep each tag concise.`;
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You output only valid JSON arrays when asked for hashtags.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 256,
    });
    const text = completion.choices[0]?.message?.content || '';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((t: unknown) => (typeof t === 'string' ? normalizeHashtag(t) : '')).filter(Boolean);
        return Array.from(new Set(cleaned)).slice(0, limit);
      }
    } catch {
      const extracted = extractHashtagsFromText(text, limit);
      if (extracted.length) return extracted;
    }
    return null;
  } catch {
    return null;
  }
}

async function generateWithGemini(input: HashtagRequestBody): Promise<string[] | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const handleText = input.twitterHandle ? `Twitter handle: @${input.twitterHandle}` : 'Twitter handle: (not provided)';
  const prompt = `You are an expert social media strategist.
Generate ${limit} highly relevant and trending hashtags for the following tweet content and account context, prioritizing reach and authenticity. Only return a JSON array of strings. Do not include any text before or after the JSON.

${handleText}
Tweet content: ${input.content}

Rules:
- Only return a JSON array of hashtags like ["#webdev", "#javascript"].
- Do not include duplicates.
- Prefer English.
- Keep each tag concise.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map((t: unknown) => (typeof t === 'string' ? normalizeHashtag(t) : '')).filter(Boolean);
        return Array.from(new Set(cleaned)).slice(0, limit);
      }
    } catch {
      const extracted = extractHashtagsFromText(text, limit);
      if (extracted.length) return extracted;
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveTwitterHandleViaClerk(): Promise<string> {
  try {
    const user = await currentUser();
    if (!user?.id) return '';
    const client = await clerkClient();
    const fullUser: any = await client.users.getUser(user.id);
    const externalAccounts: any[] = (fullUser as any).externalAccounts || (fullUser as any).external_accounts || [];
    const twitterAccount = externalAccounts.find((acc: any) => ['oauth_twitter', 'oauth_x', 'twitter', 'x'].includes(acc.provider));
    if (!twitterAccount) return '';
    const possible = (twitterAccount.username || twitterAccount.handle || twitterAccount.screenName || twitterAccount.providerUsername || twitterAccount.login || twitterAccount.externalUsername) as string | undefined;
    return possible ? possible.replace(/^@/, '') : '';
  } catch {
    return '';
  }
}


