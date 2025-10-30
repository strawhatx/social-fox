// Minimal shared types for chat/draft features

export type MessageAttachment = {
  url: string;
  type?: string | null;
};

export type MessageContent = {
  text: string;
  attachments?: MessageAttachment[];
};

export type Draft = {
  id: string;
  text: string;
  tone: string;
  length: number;
};


