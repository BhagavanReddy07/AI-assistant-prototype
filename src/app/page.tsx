"use client";

import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAiResponse } from './actions';
import type { Conversation, Message } from '@/lib/types';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatHistorySidebar } from '@/components/chat/chat-history-sidebar';
import { ChatPanel } from '@/components/chat/chat-panel';
import { MemoryEditorPanel } from '@/components/chat/memory-editor-panel';
import { useToast } from '@/hooks/use-toast';

// Mock UUID for now as it may cause issues in some environments without proper setup
const mockUuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export default function Home() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
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
        if (parsedConvos.length > 0) {
          // setActiveConversationId(parsedConvos[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    if (isClient) {
      try {
        // In a production app, this would save to a database.
        // Recent chats could be cached in Redis for faster access.
        if (conversations.length > 0) {
          localStorage.setItem('personal-ai-proto-chats', JSON.stringify(conversations));
        }
      } catch (error) {
        console.error("Failed to save conversations to localStorage", error);
      }
    }
  }, [conversations, isClient]);

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

  const handleSendMessage = async (userInput: string) => {
    const userMessage: Message = {
      id: mockUuid(),
      role: 'user',
      content: userInput,
      createdAt: new Date(),
    };
    
    let convoId = activeConversationId;

    // Create a new conversation if one isn't active
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

    const { response, intent, entities } = await getAiResponse(userInput);

    if (intent === 'manageTasks' && entities.includes('add')) {
        toast({
            title: "Task Added",
            description: "Your new task has been added to the Task Manager.",
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
