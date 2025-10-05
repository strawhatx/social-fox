// Mock data for the Social Fox MVP

export interface Draft {
  text: string;
  tone: string;
  length: number;
}

export interface MessageContent {
  text: string;
  drafts?: Draft[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: MessageContent;
  timestamp: Date;
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
    id: 'hot-take',
    label: 'Hot Take',
    prompt: 'Write me a bold take about [topic] that will stir debate but stay witty',
    category: 'Engagement'
  },
  {
    id: 'relatable',
    label: 'Relatable',
    prompt: 'Turn this [situation] into a short, funny post people on X will instantly relate to',
    category: 'Engagement'
  },
  {
    id: 'build-in-public',
    label: 'Build in Public',
    prompt: 'Help me share my latest [feature/progress] in a way that feels authentic, not salesy',
    category: 'Growth'
  },
  {
    id: 'audience-question',
    label: 'Audience Question',
    prompt: 'Draft a post asking my followers about [topic] that makes them want to reply',
    category: 'Engagement'
  },
  {
    id: 'quick-tip',
    label: 'Quick Tip',
    prompt: 'Turn this idea about [tool/skill] into a punchy, no-fluff tip post',
    category: 'Education'
  },
  {
    id: 'personal-story',
    label: 'Personal Story',
    prompt: 'Help me tell a short story about when I [struggled/succeeded] at [topic] that ends with a lesson',
    category: 'Storytelling'
  }
];

export function parseAIVariations(text: string): string[] {
  return text
    .split(/\n\s*-\s/)        // split by newlines starting with "-"
    .map(v => v.trim())        // trim extra whitespace
    .filter(v => v.length > 0) // remove empty entries
    .map(v => (v.startsWith("-") ? v.slice(1).trim() : v)); // remove leading dash if present
}

