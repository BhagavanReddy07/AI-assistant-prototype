'use server';

import { initialIntentDetection } from '@/ai/flows/initial-intent-detection';
import { extractEntities } from '@/ai/flows/extract-entities-from-message';
import { generateResponseFromIntentAndEntities } from '@/ai/flows/generate-response-from-intent-and-entities';
import { summarizeConversationForMemory } from '@/ai/flows/summarize-conversation-for-memory';
import type { Task, Message } from '@/lib/types';


export async function getAiResponse(userInput: string): Promise<{ response: string; intent: string; entities: string[], task: Omit<Task, 'id'> | null }> {
    try {
        // These can run in parallel, but the final response depends on the others,
        // so we can simplify and run them sequentially or use Promise.all for some.
        const finalResponseResult = await generateResponseFromIntentAndEntities({ userInput });

        const { response, task } = finalResponseResult;

        if (!response) {
            throw new Error('AI failed to generate a response.');
        }
        
        // For now, we'll derive intent and entities from the final response flow if needed, 
        // or just return placeholders.
        return { response, intent: 'derived', entities: [], task };

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