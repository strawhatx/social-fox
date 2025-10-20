import OpenAI from 'openai';

type RoleContent = { role: string; content: string };

type ImageSize = '256x256' | '512x512' | '1024x1024' | '2048x2048';
type ImageQuality = 'low' | 'medium' | 'high' | 'auto';
type ImageStyle = 'vivid' | 'natural';

interface ImageOptions {
  size?: ImageSize;
  count?: number; // number of images to generate
  quality?: ImageQuality;
  style?: ImageStyle;
  background?: 'transparent' | 'white' | 'black';
}

// Provider image helpers
async function callGrokImage(prompt: string, options: ImageOptions = {}): Promise<string[]> {
  const key = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
  if (!key) return [];
  const size = (options.size || '1024x1024') as '1024x1024' | '512x512' | '256x256';
  try {
    const resp = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, size }),
    });
    if (!resp.ok) return [];
    const data: any = await resp.json();
    const urls: string[] = Array.isArray(data?.data) ? data.data.map((d: any) => d?.url).filter(Boolean) : [];
    return urls;
  } catch {
    return [];
  }
}

async function callGeminiImage(prompt: string, options: ImageOptions = {}): Promise<string[]> {
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || '';
  if (!geminiKey) return [];
  const size = (options.size || '1024x1024') as '1024x1024' | '512x512' | '256x256';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateImage?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: prompt }, size }),
      }
    );
    if (!res.ok) return [];
    const rj: any = await res.json();
    const items: any[] = Array.isArray(rj?.data) ? rj.data : [];
    const images: string[] = [];
    for (const it of items) {
      if (typeof it?.url === 'string') images.push(it.url);
      else if (typeof it?.b64_json === 'string') images.push(it.b64_json);
    }
    return images;
  } catch {
    return [];
  }
}


function buildPromptString(prompts: RoleContent[]): string {
  // Join all user/system content into a single descriptive prompt for image generation
  // Keep only content fields to avoid polluting the image prompt with roles
  return prompts.map(p => p.content?.trim()).filter(Boolean).join('\n\n');
}

async function callOpenAIImage(prompt: string, options: ImageOptions = {}): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) return [];

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  const size: ImageSize = options.size || '1024x1024';
  const n = Math.max(1, Math.min(options.count || 1, 10));
  const quality: ImageQuality = options.quality || 'medium';
  const style: ImageStyle | undefined = options.style;
  const background = options.background;

  const response = await openai.images.generate({
    model,
    prompt,
    size,
    n,
    quality,
    style,
    background
  } as any);

  const images = (response?.data || [])
    .map((d: any) => d?.b64_json)
    .filter((b64: unknown): b64 is string => typeof b64 === 'string' && !!b64);

  return images;
}

export async function generateImagesFromPrompt(
  prompts: RoleContent[],
  options: ImageOptions = {}
): Promise<string[]> {
  const prompt = buildPromptString(prompts);
  if (!prompt) return [];
  // Try image providers in order: Grok → OpenAI → Gemini
  let images = await callGrokImage(prompt, options);
  if (!images.length) images = await callOpenAIImage(prompt, options);
  if (!images.length) images = await callGeminiImage(prompt, options);
  return images;
}

