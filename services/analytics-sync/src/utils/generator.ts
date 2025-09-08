import OpenAI from 'openai';

type Profile = {
    handle: string | null;
    name?: string | null;
    description?: string | null;
    followers_count?: number | null;
    following_count?: number | null;
    tweet_count?: number | null;
    // Preferred: pass recent tweet texts directly
    samples?: string[] | null;
    // Back-compat: allow { data: [{ text }] } shape if provided inline
    last_posts?: any | null;
};

type GeminiResponse = {
    candidates: {
        content: {
            parts: { text: string }[];
        };
    }[];
};

function buildPrompt(profile: Profile, count: number): string {
    const direct = Array.isArray(profile?.samples) ? profile.samples : [];
    const fallback = Array.isArray(profile?.last_posts?.data)
        ? (profile.last_posts.data as any[]).map((p: any) => String(p?.text || '')).filter(Boolean)
        : [];
    const examples = (direct.length ? direct : fallback).slice(0, 5);
    const lastSamples = examples.map((t) => `- ${t}`).join('\n');
    return `You are an assistant that writes high-quality, concise tweets for the user @${profile.handle || 'user'}. 
Profile:
- Name: ${profile.name || ''}
- Bio: ${profile.description || ''}
- Followers: ${profile.followers_count ?? ''}
- Following: ${profile.following_count ?? ''}
- Tweet Count: ${profile.tweet_count ?? ''}

Recent style examples (if any):
${lastSamples}

Task: Generate ${count} tweet drafts. 
Guidelines:
- Keep each tweet under 280 characters.
- No hashtags unless essential; no links.
- Vary tone across tweets but keep it authentic to the profile.
- Do not number the items.
- Return as a JSON array of strings only.`;
}

export async function generateTweetsFromProfile(profile: Profile, count: number): Promise<string[]> {
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GOOGLE_API_KEY;

    // Try OpenAI first
    if (openaiKey) {
        try {
            const openai = new OpenAI({ apiKey: openaiKey });
            const prompt = buildPrompt(profile, count);

            console.log('OpenAI prompt:', prompt);

            const resp = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
            });

            console.log('OpenAI response:', resp);

            const text = resp.choices?.[0]?.message?.content || '[]';
            const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

            if (Array.isArray(parsed))
                return parsed.map(String).slice(0, count);
        } catch (e) {
            // fall through to gemini
            console.log('OpenAI error:', e);
        }
    }

    // Fallback to Gemini
    if (geminiKey) {
        try {
            const prompt = buildPrompt(profile, count)
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: { temperature: 0.7 }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                if (errorText.includes("429") || errorText.includes("Too Many Requests"))
                    console.log("Rate limit hit, retrying after delay...");
                else
                    console.log("Gemini error:", errorText);
            }

            const responseJson = await response.json() as GeminiResponse;
            const text = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

            if (Array.isArray(parsed))
                return parsed.map(String).slice(0, count);
        } catch (e) {
            console.log("Gemini error:", e);
        }
    }

    return [];
}


