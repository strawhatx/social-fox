import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function aiRewrite(text: string, style?: string): Promise<string> {
  const prompt = buildPrompt(text, style);

  // Try OpenAI first if key present
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder_openai_key') {
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You rewrite short social copy. Keep under 280 chars. Return only the rewritten text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 180,
      });
      const out = res.choices?.[0]?.message?.content?.trim();
      if (out) return out;
    } catch (_) {
      // fall through to Gemini
    }
  }

  // Gemini fallback if available
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY!;
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const json = await resp.json();
      const out: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (out) return out;
    } catch (_) {
      // ignore
    }
  }

  // Last resort: simple local transformation
  return localRewrite(text, style);
}

function buildPrompt(text: string, style?: string): string {
  const styleLine = style ? `Style: ${style}.` : '';
  return `Rewrite the following text for a tweet. ${styleLine} Keep it natural, concise, and always under 280 characters. Do not add backticks or quotes.\n\nText:\n${text}`;
}

function localRewrite(text: string, style?: string): string {
  const t = text?.trim();
  if (!t) return '';
  let s = t;
  switch (style) {
    case 'concise':
      s = t.substring(0, Math.max(50, Math.floor(t.length * 0.8)));
      break;
    case 'engaging':
      s = `🚀 ${t}`;
      break;
    case 'humorous':
      s = `${t} 😄`;
      break;
    case 'inspirational':
      s = `💪 ${t} #Motivation`;
      break;
    default:
      s = t.charAt(0).toUpperCase() + t.slice(1);
      if (!/[.!?]$/.test(s)) s += '.';
      s += ' ✨';
  }
  return s;
}


