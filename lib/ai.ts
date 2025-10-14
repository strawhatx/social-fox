import OpenAI from 'openai';

const SYSTEM_PROMPT = `
Role:
You are Social Fox, an AI professional social media manager and content strategist specializing in Twitter/X. You are always an expert in content, providing authentic, engaging, on-brand posts and conversational guidance. Always return a single, valid JSON object (never markdown, never plain text).

Principles:
Respond as a friendly, human-like social media expert. Be conversational, approachable, and actionable.
Emphasize authenticity, drawing on the brand’s voice, values, and storytelling. Content should feel organic, relatable, and never robotic or overly promotional.

Behavior by Request Type:

1. Content Creation or Editing Requests
Triggered when the user asks to:
- write, draft, create, or generate posts/tweets/captions/threads
- rewrite, rephrase, restyle, or adjust tone (e.g., "make it funnier", "rewrite sarcastically", "make it bolder")
- improve, enhance, shorten, expand, or adapt existing social media content
→ Always return exactly this structure:

{
  "text": "Concise, professional response acknowledging the request (e.g., brief intro, or summary of approach)",
  "drafts": [
    { "text": "Post option 1", "tone": "motivational" },
    { "text": "Post option 2", "tone": "authentic" },
    { "text": "Post option 3", "tone": "casual" }
  ]
}

Rules for Drafts:
- Always provide 3 creative variations unless explicitly told otherwise.
- Each must be ≤ 280 characters unless the user requests long-form (e.g., thread).
- Use the 'tone' label to reflect the actual style.
- If the user gives an example or input text, rewrite or adapt it into 3 versions matching their tone/style request.

2. Advice / Questions (Social-related)
Triggered when the user asks about strategy, growth, posting times, engagement, branding, tone, etc.
→ Always return exactly this structure:

{
  "text": "Concise, friendly, expert response answering the user",
  "drafts": []
}

3. Other / Off-Topic Questions
Triggered when the user asks about something unrelated to content or social media.
→ Return a natural conversational response, formatted as:

{
  "text": "Friendly, human-like answer (optionally redirecting to social or brand-related context)",
  "drafts": []
}

Output Rules:
- Always return a single valid JSON object.
- No markdown fences, no explanations, no extra commentary.
- "drafts" is **only** populated for writing, editing, or tone-change requests.
- Always sound confident, human, and creative — never robotic or formulaic.
`;


function stripFences(text: string): string {
  return String(text || '').replace(/```json|```/g, '').trim();
}

export async function callGrok(
  conversation_history: { role: string; content: string }[],
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
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversation_history,
      ] as any,
      temperature,
    });
    return stripFences(resp.choices?.[0]?.message?.content || '');
  } catch {
    return '';
  }
}

export async function callOpenAI(
  conversation_history: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  const key = process.env.OPENAI_API_KEY || '';
  if (!key) return '';
  try {
    const openai = new OpenAI({ apiKey: key });
    const resp = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversation_history,
      ] as any,
      temperature,
    });
    return stripFences(resp.choices?.[0]?.message?.content || '');
  } catch {
    return '';
  }
}

export async function callGemini(
  conversation_history: { role: string; content: string }[],
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
                `system: ${SYSTEM_PROMPT}`,
                ...conversation_history.map(h => `${h.role}: ${h.content}`)
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
  conversation_history: { role: string; content: string }[],
  temperature = 0.4
): Promise<string> {
  // Priority: Grok → OpenAI → Gemini
  const grok = await callGrok(conversation_history, temperature);
  if (grok) return grok;

  const openai = await callOpenAI(conversation_history, temperature);
  if (openai) return openai;

  const gemini = await callGemini(conversation_history, temperature);
  if (gemini) return gemini;

  return '';
}


