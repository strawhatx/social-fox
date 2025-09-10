// Mock data for the Social Fox MVP

export interface Draft {
  id: string;
  text: string;
  tone: string;
  length: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  drafts?: Draft[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Generation {
  id: string;
  prompt: string;
  tone: string;
  drafts: Draft[];
  timestamp: Date;
}

export const TONE_PRESETS = [
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'motivational', label: 'Motivational', emoji: '💪' },
  { id: 'educational', label: 'Educational', emoji: '📚' },
  { id: 'humorous', label: 'Humorous', emoji: '😄' }
] as const;

export type ToneType = typeof TONE_PRESETS[number]['id'];

export const QUICK_TEMPLATES = [
  {
    id: 'build-in-public',
    label: 'Build in Public',
    prompt: 'Share an update about building in public',
    category: 'Growth'
  },
  {
    id: 'lesson-learned',
    label: 'Lesson Learned',
    prompt: 'Share a key lesson you learned recently',
    category: 'Education'
  },
  {
    id: 'weekend-project',
    label: 'Weekend Project',
    prompt: 'Talk about a side project you worked on',
    category: 'Building'
  },
  {
    id: 'hot-take',
    label: 'Hot Take',
    prompt: 'Share a controversial opinion about tech/business',
    category: 'Opinion'
  }
];

// Mock AI generation function
export async function generateDrafts(prompt: string, tone: ToneType): Promise<Draft[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Generate 2-3 mock drafts based on prompt and tone
  const draftTemplates = {
    motivational: [
      "🚀 {prompt}. Every expert was once a beginner. Keep pushing forward!",
      "💪 {prompt}. Your future self will thank you for starting today.",
      "🔥 {prompt}. Success isn't about perfection, it's about persistence."
    ],
    spicy: [
      "🌶️ Hot take: {prompt}. Most people won't agree, but that's the point.",
      "🔥 Unpopular opinion: {prompt}. Change my mind.",
      "⚡ {prompt}. If you're not making waves, you're not making progress."
    ],
    educational: [
      "📚 {prompt}. Here's what I learned along the way:",
      "💡 {prompt}. Key takeaways for anyone starting out:",
      "🎯 {prompt}. Three things I wish I knew earlier:"
    ],
    humorous: [
      "😄 {prompt}. It's like they say: if you can't laugh at yourself, I'll do it for you!",
      "🤣 {prompt}. Plot twist: nobody knows what they're doing.",
      "😅 {prompt}. Confidence is 10% ability and 90% not knowing how hard it actually is."
    ]
  };
  
  const templates = draftTemplates[tone] || draftTemplates['motivational'];
  const numDrafts = Math.floor(Math.random() * 2) + 2; // 2-3 drafts
  
  return templates.slice(0, numDrafts).map((template, index) => {
    const text = template.replace('{prompt}', prompt);
    return {
      id: `draft-${Date.now()}-${index}`,
      text,
      tone,
      length: text.length
    };
  });
}
