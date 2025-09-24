'use server';
/**
 * @fileOverview Extracts key entities from a user message using a pre-trained model.
 *
 * - extractEntities - A function that extracts entities from the message.
 * - ExtractEntitiesInput - The input type for the extractEntities function.
 * - ExtractEntitiesOutput - The return type for the extractEntities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEntitiesInputSchema = z.object({
  message: z.string().describe('The user message to extract entities from.'),
});
export type ExtractEntitiesInput = z.infer<typeof ExtractEntitiesInputSchema>;

const ExtractEntitiesOutputSchema = z.object({
  entities: z
    .array(z.string())
    .describe('The extracted entities from the user message.'),
});
export type ExtractEntitiesOutput = z.infer<typeof ExtractEntitiesOutputSchema>;

export async function extractEntities(input: ExtractEntitiesInput): Promise<ExtractEntitiesOutput> {
  return extractEntitiesFlow(input);
}

const extractEntitiesPrompt = ai.definePrompt({
  name: 'extractEntitiesPrompt',
  input: {schema: ExtractEntitiesInputSchema},
  output: {schema: ExtractEntitiesOutputSchema},
  prompt: `You are an expert at extracting entities from text. Extract the key entities from the following message:

Message: {{{message}}}

Entities:`,
});

const extractEntitiesFlow = ai.defineFlow(
  {
    name: 'extractEntitiesFlow',
    inputSchema: ExtractEntitiesInputSchema,
    outputSchema: ExtractEntitiesOutputSchema,
  },
  async input => {
    const {output} = await extractEntitiesPrompt(input);
    return output!;
  }
);
