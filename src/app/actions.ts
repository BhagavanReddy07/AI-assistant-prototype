'use server';

import { initialIntentDetection } from '@/ai/flows/initial-intent-detection';
import { extractEntities } from '@/ai/flows/extract-entities-from-message';
import { generateResponseFromIntentAndEntities } from '@/ai/flows/generate-response-from-intent-and-entities';


export async function getAiResponse(userInput: string): Promise<{ response: string; intent: string; entities: string[] }> {
    try {
        const [intentResult, entitiesResult, finalResponseResult] = await Promise.all([
            initialIntentDetection({ message: userInput }),
            extractEntities({ message: userInput }),
            generateResponseFromIntentAndEntities({ userInput }),
        ]);

        const { intent } = intentResult;
        const { entities } = entitiesResult;
        const { response } = finalResponseResult;

        if (!response) {
            throw new Error('AI failed to generate a response.');
        }
        
        return { response, intent, entities };

    } catch (error) {
        console.error("Error getting AI response:", error);
        return {
            response: "I'm sorry, I encountered an error while processing your request. Please try again.",
            intent: 'error',
            entities: [],
        };
    }
}
