import OpenAI from 'openai';

function stripFences(text: string): string {
  return String(text || '').replace(/```json|```/g, '').trim();
}

export async function generateJsonFromPrompt(prompt: string, temperature = 0.4): Promise<string> {
  let jsonText = '';

  // Primary: OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
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
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature } }),
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


