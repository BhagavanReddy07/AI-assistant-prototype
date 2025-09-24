"use client";

import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAiResponse } from './actions';
import type { Conversation, Message, Task } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatHistorySidebar } from '@/components/chat/chat-history-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import { MemoryEditorPanel } from '@/components/chat/memory-editor-panel';
import { useToast } from '@/hooks/use-toast';

// Mock UUID for now as it may cause issues in some environments without proper setup
const mockUuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const mockTasks: Task[] = [
    { id: '1', type: 'Reminder', content: 'Call mom', time: '2024-08-15T14:00:00' },
    { id: '2', type: 'Task', content: 'Finish project report' },
    { id: '3', type: 'Alarm', content: 'Wake up', time: '2024-08-15T07:00:00' },
];

export default function Home() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [isClient, setIsClient] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    try {
      // In a production app, this would fetch from a database (e.g., PostgreSQL).
      // For this prototype, we use localStorage to persist chat history.
      const storedConversations = localStorage.getItem('personal-ai-proto-chats');
      if (storedConversations) {
        const parsedConvos = JSON.parse(storedConversations) as Conversation[];
        setConversations(parsedConvos.map(c => ({...c, createdAt: new Date(c.createdAt)})));
      }
      const storedTasks = localStorage.getItem('personal-ai-proto-tasks');
      if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    if (isClient) {
      try {
        if (conversations.length > 0) {
          localStorage.setItem('personal-ai-proto-chats', JSON.stringify(conversations));
        }
        localStorage.setItem('personal-ai-proto-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [conversations, tasks, isClient]);

  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: mockUuid() };
    setTasks(prev => [newTask, ...prev]);
    toast({
        title: "Task Added",
        description: `Your ${newTask.type.toLowerCase()} has been added.`,
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSendMessage = async (userInput: string) => {
    const userMessage: Message = {
      id: mockUuid(),
      role: 'user',
      content: userInput,
      createdAt: new Date(),
    };
    
    let convoId = activeConversationId;

    if (!convoId) {
      const newConversation: Conversation = {
        id: mockUuid(),
        title: userInput.substring(0, 30) + (userInput.length > 30 ? '...' : ''),
        createdAt: new Date(),
        messages: [userMessage],
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      convoId = newConversation.id;
    } else {
       setConversations(prev => prev.map(c => 
        c.id === convoId ? { ...c, messages: [...c.messages, userMessage] } : c
      ));
    }

    const assistantMessageId = mockUuid();
    const loadingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isProcessing: true,
      createdAt: new Date(),
    };

    setConversations(prev => prev.map(c => 
      c.id === convoId ? { ...c, messages: [...c.messages, loadingMessage] } : c
    ));

    const { response, intent, entities, task } = await getAiResponse(userInput);

    if (task) {
        handleAddTask(task);
    }
    
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: response,
      intent,
      entities,
      isProcessing: false,
      createdAt: new Date(),
    };

    setConversations(prev => prev.map(c => {
      if (c.id === convoId) {
        const updatedMessages = c.messages.map(m => m.id === assistantMessageId ? assistantMessage : m);
        return { ...c, messages: updatedMessages };
      }
      return c;
    }));
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background text-foreground font-body">
        <ChatHistorySidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          tasks={tasks}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
        />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <ChatPanel
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
          />
        </main>
        <MemoryEditorPanel />
      </div>
    </SidebarProvider>
  );
}
