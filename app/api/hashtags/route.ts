// Hashtags API
// POST /api/hashtags
// - Primary: OpenAI generates hashtags for given tweet content
// - Fallback: Gemini
// - Final fallback: simple heuristic suggestions
// Notes:
// - No GET handler; we intentionally avoid query-based scraping
// - Keep responses small; caller controls `limit` (capped to 25)
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Common generic fallbacks to ensure the UI always has something to show
const DEFAULT_FALLBACKS: Record<string, string[]> = {
  default: [
    "#dev",
    "#coding",
    "#100DaysOfCode",
    "#webdev",
    "#javascript",
    "#typescript",
    "#reactjs",
    "#frontend",
    "#software",
    "#programming",
  ],
};

// Builds heuristic fallback hashtags from a seed word and generic pool
function buildFallbackHashtags(query: string, limit: number): string[] {
  const seed = query.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const seeded: string[] = [];
  if (seed) {
    const base = `#${seed}`;
    const variants = [
      base,
      `#${seed}tips`,
      `#${seed}dev`,
      `#learn${seed}`,
      `#${seed}community`,
    ];
    seeded.push(...variants);
  }
  const pool = [...seeded, ...DEFAULT_FALLBACKS.default];
  const unique = Array.from(new Set(pool));
  return unique.slice(0, Math.max(1, Math.min(25, limit)));
}


// Request payload for POST /api/hashtags
type HashtagRequestBody = {
  content: string;
  twitterHandle?: string | null;
  limit?: number;
};

// Ensures hashtags start with # and contain only safe characters
function normalizeHashtag(tag: string): string {
  let cleaned = tag.trim();
  if (!cleaned) return "";
  if (!cleaned.startsWith("#")) cleaned = `#${cleaned}`;
  // drop trailing punctuation
  cleaned = cleaned.replace(/[^#a-zA-Z0-9_]/g, "");
  return cleaned;
}

// Attempts to extract hashtags from freeform LLM text fallback
function extractHashtagsFromText(text: string, limit: number): string[] {
  const matches = text.match(/#[a-zA-Z0-9_]{2,}/g) || [];
  const unique = Array.from(new Set(matches.map(normalizeHashtag)));
  return unique.slice(0, Math.max(1, Math.min(25, limit)));
}

// Calls OpenAI to generate a JSON array of hashtags
async function generateWithOpenAI(input: HashtagRequestBody): Promise<string[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const client = new OpenAI({ apiKey });
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const handleText = input.twitterHandle ? `Twitter handle: @${input.twitterHandle}` : "Twitter handle: (not provided)";
  const prompt = `You are an expert social media strategist.
Generate ${limit} highly relevant and trending hashtags for the following tweet content and account context, prioritizing reach and authenticity. Only return a JSON array of strings. Do not include any text before or after the JSON.

${handleText}
Tweet content: ${input.content}

Rules:
- Only return a JSON array of hashtags like ["#webdev", "#javascript"].
- Do not include duplicates.
- Prefer English.
- Keep each tag concise.
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You output only valid JSON arrays when asked for hashtags." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 256,
    });
    const text = completion.choices[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((t: unknown) => (typeof t === "string" ? normalizeHashtag(t) : ""))
          .filter(Boolean);
        return Array.from(new Set(cleaned)).slice(0, limit);
      }
    } catch {
      // Fallback: extract hashtags from freeform text
      const extracted = extractHashtagsFromText(text, limit);
      if (extracted.length) return extracted;
    }
    return null;
  } catch {
    return null;
  }
}

// Calls Gemini to generate a JSON array of hashtags
async function generateWithGemini(input: HashtagRequestBody): Promise<string[] | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const limit = Math.max(1, Math.min(25, input.limit || 10));
  const handleText = input.twitterHandle ? `Twitter handle: @${input.twitterHandle}` : "Twitter handle: (not provided)";
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((t: unknown) => (typeof t === "string" ? normalizeHashtag(t) : ""))
          .filter(Boolean);
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

// POST handler: Generates hashtags using OpenAI → Gemini → heuristic fallbacks
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HashtagRequestBody;
    const content = (body.content || "").trim();
    const limitParam = Number.isFinite(body.limit as number) ? (body.limit as number) : 10;
    const limit = Math.min(Math.max(limitParam, 1), 25);
    const twitterHandle = (body.twitterHandle || "").replace(/^@/, "");

    if (!content) {
      return NextResponse.json({ error: "Missing required 'content' in body" }, { status: 400 });
    }

    // Try OpenAI first
    let hashtags = await generateWithOpenAI({ content, twitterHandle, limit });
    let source: "openai" | "gemini" | "fallback" = "openai";

    // Fallback to Gemini
    if (!hashtags || hashtags.length === 0) {
      hashtags = await generateWithGemini({ content, twitterHandle, limit });
      source = "gemini";
    }

    // Final fallback to heuristics
    if (!hashtags || hashtags.length === 0) {
      // Use last significant word as query seed
      const words = content
        .toLowerCase()
        .replace(/[#@]/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      const seed = words.pop() || "developer";
      hashtags = buildFallbackHashtags(seed, limit);
      source = "fallback";
    }

    return NextResponse.json({ source, hashtags });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}


