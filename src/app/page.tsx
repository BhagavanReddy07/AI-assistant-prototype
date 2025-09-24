"use client";

import * as React from 'react';
import { getAiResponse, summarizeConversation } from './actions';
import type { Conversation, Message, Task, Memory } from '@/lib/types';
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

const mockMemories: Memory[] = [
  { id: '1', content: "User's birthday is October 26th." },
  { id: '2', content: "Favorite color is Teal (#008080)." },
  { id: '3', content: 'Prefers communication to be formal and concise.' },
];


export default function Home() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [memories, setMemories] = React.useState<Memory[]>(mockMemories);
  const [isClient, setIsClient] = React.useState(false);
  const { toast } = useToast();
  const activeConversationRef = React.useRef(activeConversationId);


  React.useEffect(() => {
    setIsClient(true);
    try {
      // In a production app, this would fetch from a database (e.g., PostgreSQL).
      // For this prototype, we use localStorage to persist data.
      const storedConversations = localStorage.getItem('personal-ai-proto-chats');
      if (storedConversations) {
        const parsedConvos = JSON.parse(storedConversations) as Conversation[];
        setConversations(parsedConvos.map(c => ({...c, createdAt: new Date(c.createdAt)})));
      }
      const storedTasks = localStorage.getItem('personal-ai-proto-tasks');
      if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
      }
      const storedMemories = localStorage.getItem('personal-ai-proto-memories');
        if (storedMemories) {
            setMemories(JSON.parse(storedMemories));
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
        if (memories.length > 0) {
            localStorage.setItem('personal-ai-proto-memories', JSON.stringify(memories));
        }
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [conversations, tasks, memories, isClient]);
  
  // Update the ref whenever activeConversationId changes
  React.useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  const activeConversation = React.useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);
  
  const handleAddMemory = async (content: string) => {
    if (content.trim() === '') return;
    const newMemory: Memory = { id: mockUuid(), content };
    setMemories(prev => [newMemory, ...prev]);
  };

  const createMemoryFromConversation = async (conversation: Conversation) => {
    // Don't create memories for short conversations
    if (conversation.messages.length <= 2) return;

    const summary = await summarizeConversation(conversation.messages);
    if (summary) {
      await handleAddMemory(summary);
      toast({
        title: "Memory Saved",
        description: "SABA has learned something new from your conversation.",
      });
    }
  };

  const handleSelectConversation = async (id: string) => {
    const previousConversationId = activeConversationRef.current;
    if (previousConversationId && previousConversationId !== id) {
      const previousConversation = conversations.find(c => c.id === previousConversationId);
      if (previousConversation) {
        await createMemoryFromConversation(previousConversation);
      }
    }
    setActiveConversationId(id);
  };

  const handleNewConversation = async () => {
     const previousConversationId = activeConversationRef.current;
    if (previousConversationId) {
      const previousConversation = conversations.find(c => c.id === previousConversationId);
      if (previousConversation) {
        await createMemoryFromConversation(previousConversation);
      }
    }
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
  };
  
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(mem => mem.id !== id));
  };

  const handleSendMessage = async (userInput: string) => {
    const userMessage: Message = {
      id: mockUuid(),
      role: 'user',
      content: userInput,
      createdAt: new Date(),
    };
    
    let currentConvoId = activeConversationId;

    if (!currentConvoId) {
      const newConversation: Conversation = {
        id: mockUuid(),
        title: userInput.substring(0, 30) + (userInput.length > 30 ? '...' : ''),
        createdAt: new Date(),
        messages: [userMessage],
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      currentConvoId = newConversation.id;
    } else {
       setConversations(prev => prev.map(c => 
        c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage] } : c
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
      c.id === currentConvoId ? { ...c, messages: [...c.messages, loadingMessage] } : c
    ));

    const { response, intent, entities, task } = await getAiResponse(userInput);
    
    if (task) {
        handleAddTask(task);
        toast({
            title: "Task Added",
            description: `Your ${task.type.toLowerCase()} has been added.`,
        });
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
      if (c.id === currentConvoId) {
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
          onSelectConversation={handleSelectConversation}
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
        <MemoryEditorPanel 
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
        />
      </div>
    </SidebarProvider>
  );
}