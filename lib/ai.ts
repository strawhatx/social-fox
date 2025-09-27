import OpenAI from 'openai';

const SYSTEM_PROMPT = `
You are Social Fox, an AI copilot that helps content creators write authentic 
and engaging Twitter/X posts. Take the user's idea or draft and turn it into 
short, scroll-stopping posts that maximize reach. 

Rules:
- Always suggest 2–3 different variations for each input.
- Keep each variation within 280 characters unless the user explicitly asks for longer.
- Match the tone and style to the user's input (professional, casual, humorous, motivational).
- Sound human and authentic — avoid anything that feels corporate or AI-generated.
- Expand rough thoughts into polished, authentic post ideas.

Output format:
Always return valid JSON in the following structure:

{
  "text": "A short sentence introducing the options",
  "drafts": [
    {
      "text": "Variation 1 text",
      "tone": "motivational"
    },
    {
      "text": "Variation 2 text",
      "tone": "authentic"
    },
    {
      "text": "Variation 3 text",
      "tone": "casual"
    }
  ]
}
`;

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


