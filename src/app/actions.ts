'use server';

import { initialIntentDetection } from '@/ai/flows/initial-intent-detection';
import { extractEntities } from '@/ai/flows/extract-entities-from-message';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const finalResponsePrompt = ai.definePrompt({
    name: 'finalResponsePrompt',
    input: {
        schema: z.object({
            userInput: z.string(),
            intent: z.string(),
            entities: z.array(z.string()),
        }),
    },
    prompt: `You are a personal AI assistant named Proto. The user said: "{{userInput}}".
    My analysis suggests the user's intent is "{{intent}}" and the key entities are: {{JSON.stringify(entities)}}.
    Based on this information, provide a helpful and conversational response. Keep your response concise and helpful. Adapt your communication style to be sophisticated and intelligent.`,
});

export async function getAiResponse(userInput: string): Promise<{ response: string; intent: string; entities: string[] }> {
    try {
        const [intentResult, entitiesResult] = await Promise.all([
            initialIntentDetection({ message: userInput }),
            extractEntities({ message: userInput })
        ]);

        const { intent } = intentResult;
        const { entities } = entitiesResult;

        const llmResponse = await finalResponsePrompt.generate({
            input: { userInput, intent, entities },
        });

        const responseText = llmResponse.output();
        if (!responseText) {
            throw new Error('AI failed to generate a response.');
        }
        
        return { response: responseText, intent, entities };

    } catch (error) {
        console.error("Error getting AI response:", error);
        return {
            response: "I'm sorry, I encountered an error while processing your request. Please try again.",
            intent: 'error',
            entities: [],
        };
    }
}
