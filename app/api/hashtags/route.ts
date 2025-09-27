// Hashtags API
// POST /api/hashtags
// - Primary: OpenAI generates hashtags for given tweet content
// - Fallback: Gemini
// - Final fallback: simple heuristic suggestions
// Notes:
// - No GET handler; we intentionally avoid query-based scraping
// - Keep responses small; caller controls `limit` (capped to 25)
import { NextResponse } from "next/server";
import { getHashtags } from "@/lib/hashtags";

// Request payload for POST /api/hashtags
type HashtagRequestBody = { content: string; limit?: number };

// POST handler: Generates hashtags using OpenAI → Gemini → heuristic fallbacks
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as HashtagRequestBody;
        const content = (body.content || "").trim();
        const limitParam = Number.isFinite(body.limit as number) ? (body.limit as number) : 10;
        const limit = Math.min(Math.max(limitParam, 1), 25);

        if (!content) {
            return NextResponse.json({ error: "Missing required 'content' in body" }, { status: 400 });
        }

        const { source, hashtags } = await getHashtags(content, limit);
        return NextResponse.json({ source, hashtags });
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}


