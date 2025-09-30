'use server';

import { generateResponseFromIntentAndEntities } from '@/ai/flows/generate-response-from-intent-and-entities';
import { summarizeConversationForMemory } from '@/ai/flows/summarize-conversation-for-memory';
import type { Task, Message } from '@/lib/types';


export async function getAiResponse(userInput: string): Promise<{ response: string; intent: string; entities: string[], task: Omit<Task, 'id'> | null }> {
    try {
        const result = await generateResponseFromIntentAndEntities({ userInput });

        if (!result.response) {
            throw new Error('AI failed to generate a response.');
        }

        return result;

    } catch (error) {
        console.error("Error getting AI response:", error);
        return {
            response: "I'm sorry, I encountered an error while processing your request. Please try again.",
            intent: 'error',
            entities: [],
            task: null,
        };
    }
}

export async function summarizeConversation(messages: Message[]): Promise<string | null> {
    try {
        const { summary } = await summarizeConversationForMemory({ messages });
        return summary;
    } catch (error) {
        console.error("Error summarizing conversation:", error);
        return null;
    }
}