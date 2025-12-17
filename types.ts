export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Vibe {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export enum AppMode {
  PRE_WEDDING = 'PRE_WEDDING',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  CHAT_BOT = 'CHAT_BOT',
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}