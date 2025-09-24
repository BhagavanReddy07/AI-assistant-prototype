'use server';

/**
 * @fileOverview Identifies the intent of the user's message using a pre-trained model.
 *
 * - initialIntentDetection - A function that detects the intent of a given user message.
 * - InitialIntentDetectionInput - The input type for the initialIntentDetection function.
 * - InitialIntentDetectionOutput - The return type for the initialIntentDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialIntentDetectionInputSchema = z.object({
  message: z.string().describe('The user message to analyze.'),
});
export type InitialIntentDetectionInput = z.infer<typeof InitialIntentDetectionInputSchema>;

const InitialIntentDetectionOutputSchema = z.object({
  intent: z.string().describe('The identified intent of the message.'),
  confidence: z.number().describe('The confidence level of the intent detection.'),
});
export type InitialIntentDetectionOutput = z.infer<typeof InitialIntentDetectionOutputSchema>;

export async function initialIntentDetection(input: InitialIntentDetectionInput): Promise<InitialIntentDetectionOutput> {
  return initialIntentDetectionFlow(input);
}

const initialIntentDetectionPrompt = ai.definePrompt({
  name: 'initialIntentDetectionPrompt',
  input: {schema: InitialIntentDetectionInputSchema},
  output: {schema: InitialIntentDetectionOutputSchema},
  prompt: `Determine the intent of the following message:

Message: {{{message}}}

Respond with the intent and a confidence level (0-1) for your determination.  Structure the answer as a valid JSON.`,
});

const initialIntentDetectionFlow = ai.defineFlow(
  {
    name: 'initialIntentDetectionFlow',
    inputSchema: InitialIntentDetectionInputSchema,
    outputSchema: InitialIntentDetectionOutputSchema,
  },
  async input => {
    const {output} = await initialIntentDetectionPrompt(input);
    return output!;
  }
);
