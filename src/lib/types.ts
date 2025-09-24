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

export type Task = {
  id: string;
  type: 'Task' | 'Alarm' | 'Reminder';
  content: string;
  time?: string;
};
