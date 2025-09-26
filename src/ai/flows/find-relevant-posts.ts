
'use server';
/**
 * @fileOverview An AI agent that finds relevant community posts based on a search query.
 *
 * - findRelevantPosts - A function that takes a query and a list of posts and returns the most relevant ones.
 * - FindRelevantPostsInput - The input type for the findRelevantPosts function.
 * - FindRelevantPostsOutput - The return type for the findRelevantPosts function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { communityPostSchema } from '@/lib/schema';
import type { CommunityPost } from '@/lib/schema';

const FindRelevantPostsInputSchema = z.object({
  query: z.string().describe('The user\'s search query or question.'),
  posts: z.array(communityPostSchema).describe('The list of all community posts to search through.'),
});

export type FindRelevantPostsInput = z.infer<typeof FindRelevantPostsInputSchema>;

const FindRelevantPostsOutputSchema = z.object({
  relevantPosts: z.array(communityPostSchema).describe('An array of the most relevant posts, sorted by relevance.'),
});

export type FindRelevantPostsOutput = z.infer<typeof FindRelevantPostsOutputSchema>;


export async function findRelevantPosts(input: FindRelevantPostsInput): Promise<FindRelevantPostsOutput> {
  return findRelevantPostsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'findRelevantPostsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: FindRelevantPostsInputSchema},
  output: {schema: FindRelevantPostsOutputSchema},
  prompt: `You are an intelligent search assistant for a real estate platform's community hub.
  Your task is to analyze a user's search query and a list of community posts, and then return the posts that are most relevant to the query.
  The query might be a direct question or keywords. Your goal is to understand the user's *intent* and find the post(s) that best answer or address it.

  User Query:
  "{{{query}}}"

  Available Posts (JSON format):
  {{{json posts}}}

  Instructions:
  1.  Read the user's query carefully to understand what they are looking for.
  2.  Analyze the content of each post (the 'text' field is most important).
  3.  Determine which posts are the most relevant to the user's query.
  4.  Return an array of the relevant post objects, sorted from most relevant to least relevant. If no posts are relevant, return an empty array.
  `,
});

const findRelevantPostsFlow = ai.defineFlow(
  {
    name: 'findRelevantPostsFlow',
    inputSchema: FindRelevantPostsInputSchema,
    outputSchema: FindRelevantPostsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
