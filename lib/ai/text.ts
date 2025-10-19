import OpenAI from 'openai';
import { generateImagesFromPrompt } from './image';


function stripFences(text: string): string {
  return String(text || '').replace(/```json|```/g, '').trim();
}

export async function callGrok(
  prompts: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
  if (!xaiKey) return '';
  try {
    const grok = new OpenAI({
      apiKey: xaiKey,
      baseURL: process.env.XAI_BASE_URL || 'https://api.x.ai/v1'
    } as any);
    const resp = await (grok as any).chat.completions.create({
      model: process.env.XAI_MODEL || 'grok-2-latest',
      messages: [
        ...prompts,
      ] as any,
      temperature,
    });
    return stripFences(resp.choices?.[0]?.message?.content || '');
  } catch {
    return '';
  }
}

export async function callOpenAI(
  prompts: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  const key = process.env.OPENAI_API_KEY || '';
  if (!key) return '';
  try {
    const openai = new OpenAI({ apiKey: key });
    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        ...prompts,
      ] as any,
      temperature,
    });
    return stripFences(resp.choices?.[0]?.message?.content || '');
  } catch {
    return '';
  }
}

export async function callGemini(
  prompts: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || '';
  if (!geminiKey) return '';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: [
                ...prompts.map(h => `${h.role}: ${h.content}`)
              ].join('\n')
            }]
          }],
          generationConfig: { temperature }
        }),
      }
    );
    if (res.ok) {
      const rj: any = await res.json();
      const text = rj?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return stripFences(text);
    }
  } catch {}
  return '';
}

export async function generateJsonFromPrompt(
  prompts: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  // Priority: Grok → OpenAI → Gemini
  const grok = await callGrok(prompts, temperature);
  if (grok) return grok;

  const openai = await callOpenAI(prompts, temperature);
  if (openai) return openai;

  const gemini = await callGemini(prompts, temperature);
  if (gemini) return gemini;

  return '';
}

export async function getBestTimeToPost(): Promise<{ time: string }> {
  const prompts = [
    { role: 'user', content: 'What is the best 3 times to post on Twitter for the highes engagemnent? ' }
  ];
  const response = await generateJsonFromPrompt(prompts);
  const parsedResponse = JSON.parse(response || '{}');
  return { time: parsedResponse.time || '2:00 PM' };
}

export async function bulkPostGeneration(audience: string, subject: string ): Promise<{ posts: { text: string; image?: string }[] }> {
  const prompts = [
    { role: "system", content: `You are a viral Twitter ghostwriter who writes engaging, high-converting posts for ${audience}.` },
    { role: "user", content: `Generate 30 short posts about ${subject}. Return JSON in the format: { posts: [{ text: string }] }` },
  ];

  // Step 1: Generate 30 posts (text)
  const response = await generateJsonFromPrompt(prompts);
  const parsedResponse = JSON.parse(response || '{"posts": []}');
  const posts = parsedResponse.posts || [];

  if (!posts.length) {
    console.error('⚠️ No posts returned from text generation');
    return { posts: [] };
  }

  // Step 2: Generate all images in parallel (with throttling)
  const concurrency = 5; // limit to 5 at a time to avoid rate limits
  const results: { text: string; image?: string }[] = [];

  for (let i = 0; i < posts.length; i += concurrency) {
    const chunk = posts.slice(i, i + concurrency);
    const chunkResults = await Promise.allSettled(
      chunk.map(async (post: any) => {
        const prompt = `Generate a relevant image for this post: "${post.text}"`;
        const images = await generateImagesFromPrompt([{ role: "user", content: prompt }], { count: 1 });
        return { text: post.text, image: images?.[0] || "" };
      })
    );

    results.push(
      ...chunkResults.map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        console.error(`❌ Image failed for post ${i}:`, r.reason);
        return { text: chunk[i].text, image: "" };
      })
    );
  }

  return { posts: results };
}

export async function aiRewrite(text: string, style?: string): Promise<string> {
  const styleLine = style ? `Style: ${style}.` : '';

  const prompts = [
    { role: 'system', content: 'You rewrite short social copy. Keep under 280 chars. Return only the rewritten text.' },
    { role: 'user', content: `Rewrite the following text for a tweet. ${styleLine} Keep it natural, concise, and always under 280 characters. Do not add backticks or quotes.\n\nText:\n${text}` },
  ];
  
    const response = await generateJsonFromPrompt(prompts);

  if (response) return response;

  // Last resort: simple local transformation iff all the ai stuff fail
  return localRewrite(response, style);
}

export async function aiGenerate(prompt: string): Promise<string> {
  const prompts = [
    { role: 'system', content: 'You generate short social copy. Keep under 280 chars. Return only the generated text.' },
    { role: 'user', content: prompt },
  ];
  const response = await generateJsonFromPrompt(prompts);
  return response;
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


