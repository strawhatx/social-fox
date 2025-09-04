import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Profile = {
  handle: string | null;
  name?: string | null;
  description?: string | null;
  followers_count?: number | null;
  following_count?: number | null;
  tweet_count?: number | null;
  last_posts?: any | null;
};

function buildPrompt(profile: Profile, count: number): string {
  const lastSamples = Array.isArray(profile?.last_posts?.data)
    ? profile.last_posts.data.slice(0, 5).map((p: any) => `- ${p.text}`).join('\n')
    : '';
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
      
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const text = resp.choices?.[0]?.message?.content || '[]';
      const parsed = JSON.parse(text);
      
      if (Array.isArray(parsed)) 
        return parsed.map(String).slice(0, count);
    } catch (e) {
      // fall through to gemini
    }
  }

  // Fallback to Gemini
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = buildPrompt(profile, count);
      const result = await model.generateContent(prompt);
      const text = result.response.text() || '[]';
      const parsed = JSON.parse(text);
      
      if (Array.isArray(parsed)) 
        return parsed.map(String).slice(0, count);
    } catch (e) {
      // ignore
    }
  }

  return [];
}


