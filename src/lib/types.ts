export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  intent?: string;
  entities?: string[];
  isProcessing?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
};
