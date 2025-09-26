
'use server';
/**
 * @fileOverview An AI agent that finds relevant community posts based on a search query.
 *
 * - findRelevantPosts - A function that takes a query and a list of posts and returns the most relevant ones.
 * - FindRelevantPostsInput - The input type for the findRelevantPosts function.
 * - FindRelevantPostsOutput - The return type for the findRelevantPosts function.
 */

import {z} from 'zod';
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
  const { query, posts } = input;
  const lowerCaseQuery = query.toLowerCase();

  const scoredPosts = posts.map(post => {
    let score = 0;
    const postText = (post.text || '').toLowerCase();
    const authorName = (post.authorName || '').toLowerCase();
    
    if (postText.includes(lowerCaseQuery)) {
      score += 10;
    }
    if (authorName.includes(lowerCaseQuery)) {
      score += 5;
    }

    const queryWords = new Set(lowerCaseQuery.split(/\s+/).filter(w => w.length > 2));
    const postWords = new Set(postText.split(/\s+/));
    
    let keywordMatches = 0;
    queryWords.forEach(word => {
        if (postWords.has(word)) {
            keywordMatches++;
        }
    });

    score += keywordMatches;
    
    return { post, score };
  });

  const relevantPosts = scoredPosts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.post);
    
  return { relevantPosts };
}
