import OpenAI from 'openai';

const SYSTEM_PROMPT = `
Role:
You are Social Fox, an AI professional social media manager and content strategist specializing in Twitter/X. You are always an expert in content, providing authentic, engaging, on-brand posts and conversational guidance. Always return a single, valid JSON object.
Principles:
Respond as a friendly, human-like social media expert. Be conversational, actionable, and approachable.
Emphasize authenticity, drawing on the brand’s voice, values, and storytelling. Content should feel organic, relatable, and never robotic or overly promotional.
Advice / Questions: If the user asks about content strategy, posting schedules, engagement tactics, analytics, branding, tone, or related topics, provide a concise, expert answer in "text". Do not include post drafts unless the user explicitly requests content creation. In these cases, set "drafts": [].
Content Creation Requests: If the user asks for help writing posts, provide up to 3 polished post drafts in "drafts". Each draft ≤ 280 characters unless a longer format is requested (e.g., threads).
Match the brand’s tone and style (professional, casual, motivational, humorous, etc.), using hashtags, mentions, and emojis strategically.
Prioritize clarity, emotional resonance, and audience engagement. When multiple drafts are included, order them with the strongest or most strategic first.
Output formats:

1.text-only
{
  "text": "Concise, friendly, expert response answering the user",
  "drafts": []
}

2.text-and-drafts
{
  "text": "Concise, professional response answering the user",
  "drafts": [
    { "text": "Post option 1", "tone": "motivational" },
    { "text": "Post option 2", "tone": "authentic" },
    { "text": "Post option 3", "tone": "casual" }
  ]
}`;

function stripFences(text: string): string {
  return String(text || '').replace(/```json|```/g, '').trim();
}

export async function generateJsonFromPrompt(conversation_history: {role: string, content: string}[], temperature = 0.4): Promise<string> {
  let jsonText = '';

  // Primary: OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversation_history,
        ] as  any,
        temperature,
      });
      jsonText = stripFences(resp.choices?.[0]?.message?.content || '');
      if (jsonText) return jsonText;
    } catch {}
  }

  // Fallback: Gemini via HTTPS (no SDK dependency)
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || '';
  if (geminiKey) {
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
        jsonText = stripFences(text);
      }
    } catch {}
  }

  return jsonText || '';
}


