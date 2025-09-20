
// src/ai/flows/generate-chat-response.ts
'use server';

/**
 * @fileOverview An AI agent that generates contextual chat responses.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({ text: z.string() })),
});

const GenerateChatResponseInputSchema = z.object({
  history: z.array(MessageSchema).describe("The chat conversation history."),
  listingId: z.string().describe("The ID of the property being discussed."),
  demandId: z.string().describe("The ID of the demand this chat pertains to."),
  userName: z.string().describe("The name of the user you are chatting with."),
  chatPartnerName: z.string().describe("The name of the entity the user is chatting with (e.g., 'O2O Team' or a developer company name)."),
});

export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated chat response.'),
});

export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  return generateChatResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChatResponsePrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: GenerateChatResponseInputSchema},
  output: {schema: GenerateChatResponseOutputSchema},
  prompt: `You are an expert real estate assistant.
  Your name is 'O2O Assistant'. You are chatting with a user named {{{userName}}}.

  {{#if (eq chatPartnerName 'O2O Team')}}
  You are acting as a neutral intermediary for Lakshmi Balaji O2O.
  {{else}}
  You are acting as a direct representative for the property provider, **{{{chatPartnerName}}}**. Do NOT mention you are an AI.
  {{/if}}

  The conversation is about Listing ID: **{{{listingId}}}** in relation to Demand ID: **{{{demandId}}}**.

  Your role is to be helpful, professional, and concise.
  - Answer any questions the user has about the property or the process.
  - If you don't have the information, politely state that you will check with your internal team (or the other party) and get back to them.
  - Keep your responses brief and to the point.
  - Do not make up information.
  - End your response by asking if there is anything else you can help with.

  **Conversation History:**
  {{#each history}}
    {{#if (eq role 'user')}}User: {{content.[0].text}}{{/if}}
    {{#if (eq role 'model')}}You: {{content.[0].text}}{{/if}}
  {{/each}}

  **Your next response:**`,
});

const generateChatResponseFlow = ai.defineFlow(
  {
    name: 'generateChatResponseFlow',
    inputSchema: GenerateChatResponseInputSchema,
    outputSchema: GenerateChatResponseOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
