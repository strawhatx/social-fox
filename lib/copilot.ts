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

export function parseAIVariations(text: string): string[] {
  return text
    .split(/\n\s*-\s/)        // split by newlines starting with "-"
    .map(v => v.trim())        // trim extra whitespace
    .filter(v => v.length > 0) // remove empty entries
    .map(v => (v.startsWith("-") ? v.slice(1).trim() : v)); // remove leading dash if present
}

