'use server';
/**
 * @fileOverview A flow that summarizes a conversation to extract key memories about the user.
 *
 * - summarizeConversationForMemory - A function that creates a memory summary from a conversation.
 * - SummarizeConversationInput - The input type for the function.
 * - SummarizeConversationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeConversationInputSchema = z.object({
  messages: z.array(
    z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
    })
  ).describe('The conversation history.'),
});
export type SummarizeConversationInput = z.infer<typeof SummarizeConversationInputSchema>;

const SummarizeConversationOutputSchema = z.object({
  summary: z.string().nullable().describe('A concise summary of key information to remember about the user, or null if there is nothing to remember.'),
});
export type SummarizeConversationOutput = z.infer<typeof SummarizeConversationOutputSchema>;

export async function summarizeConversationForMemory(input: SummarizeConversationInput): Promise<SummarizeConversationOutput> {
  return summarizeConversationFlow(input);
}

const memoryPrompt = ai.definePrompt({
  name: 'memoryPrompt',
  input: {schema: SummarizeConversationInputSchema},
  output: {schema: SummarizeConversationOutputSchema},
  prompt: `You are a memory assistant. Your job is to analyze a conversation and extract a single, key piece of information about the user that is worth remembering.
This could be a preference, a personal detail, or an important fact.

- The memory should be a concise, single sentence.
- If no new, meaningful information about the user is revealed, output null.
- Focus on information explicitly stated by the user.
- Do not remember tasks, reminders, or alarms.
- Do not remember generic questions or pleasantries.

Conversation History:
{{#each messages}}
{{role}}: {{content}}
{{/each}}

Based on this conversation, what is the most important thing to remember about the user?`,
});

const summarizeConversationFlow = ai.defineFlow(
  {
    name: 'summarizeConversationFlow',
    inputSchema: SummarizeConversationInputSchema,
    outputSchema: SummarizeConversationOutputSchema,
  },
  async input => {
    // Don't run for very short conversations
    if (input.messages.length <= 2) {
        return { summary: null };
    }
    const {output} = await memoryPrompt(input);
    return output!;
  }
);