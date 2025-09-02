
'use server';
/**
 * @fileOverview An AI agent that calculates a match score between a property and a demand.
 *
 * - getPropertyMatchScore - A function that handles the matching process.
 * - GetPropertyMatchScoreInput - The input type for the getPropertyMatchScore function.
 * - GetPropertyMatchScoreOutput - The return type for the getPropertyMatchScore function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { demandSchema, listingSchema } from '@/lib/schema';

const GetPropertyMatchScoreInputSchema = z.object({
  demand: demandSchema.describe("The user's property demand details, including preferences."),
  listing: listingSchema.describe("The details of the property being submitted for matching."),
});
export type GetPropertyMatchScoreInput = z.infer<typeof GetPropertyMatchScoreInputSchema>;

const GetPropertyMatchScoreOutputSchema = z.object({
  overallScore: z.number().min(0).max(1).describe('The overall weighted match score from 0 to 1, where 1 is a perfect match.'),
  scoreBreakdown: z.object({
      location: z.number().min(0).max(1).describe('Score for location match (0-1). 1.0 if confirmed by provider.'),
      size: z.number().min(0).max(1).describe('Score for how well the property size matches the demand (0-1).'),
      commercials: z.number().min(0).max(1).describe('Score for the commercial terms (rent, deposit) (0-1). Assumed 0.9 if no specifics from customer.'),
      power: z.number().min(0).max(1).describe('Score for the power infrastructure (0-1). Assumed 0.9 if no specifics from customer.'),
      fireSafety: z.number().min(0).max(1).describe('Score for fire safety compliance (0-1). Assumed 0.9 if no specifics from customer.'),
      approvals: z.number().min(0).max(1).describe('Score for statutory approvals (0-1). Assumed 0.9 if no specifics from customer.'),
      amenities: z.number().min(0).max(1).describe('Score for amenities like docks and canopy (0-1).'),
    }).describe('A breakdown of scores for different categories.'),
  justification: z.string().describe('A detailed explanation for the calculated scores, highlighting strengths and weaknesses of the match for each category.'),
});
export type GetPropertyMatchScoreOutput = z.infer<typeof GetPropertyMatchScoreOutputSchema>;

export async function getPropertyMatchScore(input: GetPropertyMatchScoreInput): Promise<GetPropertyMatchScoreOutput> {
  // Return a default or placeholder score since this feature is suspended.
  return Promise.resolve({
    overallScore: 0.0,
    scoreBreakdown: {
      location: 0,
      size: 0,
      commercials: 0,
      power: 0,
      fireSafety: 0,
      approvals: 0,
      amenities: 0,
    },
    justification: "AI scoring is temporarily suspended."
  });
}
