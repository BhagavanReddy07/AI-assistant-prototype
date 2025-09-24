'use server';

import { initialIntentDetection } from '@/ai/flows/initial-intent-detection';
import { extractEntities } from '@/ai/flows/extract-entities-from-message';
import { generateResponseFromIntentAndEntities } from '@/ai/flows/generate-response-from-intent-and-entities';
import type { Task } from '@/lib/types';


export async function getAiResponse(userInput: string): Promise<{ response: string; intent: string; entities: string[], task: Omit<Task, 'id'> | null }> {
    try {
        const [intentResult, entitiesResult, finalResponseResult] = await Promise.all([
            initialIntentDetection({ message: userInput }),
            extractEntities({ message: userInput }),
            generateResponseFromIntentAndEntities({ userInput }),
        ]);

        const { intent } = intentResult;
        const { entities } = entitiesResult;
        const { response, task } = finalResponseResult;

        if (!response) {
            throw new Error('AI failed to generate a response.');
        }
        
        return { response, intent, entities, task };

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
