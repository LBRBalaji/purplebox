// src/ai/flows/predict-demand-trends.ts
'use server';

/**
 * @fileOverview An AI agent that analyzes historical data to predict future warehouse demand trends.
 * 
 * - predictDemandTrends - A function that generates predictive analytics.
 * - PredictDemandTrendsInput - The input type for the predictDemandTrends function.
 * - PredictDemandTrendsOutput - The return type for the predictDemandTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import allDemands from '@/data/demands.json';
import allListings from '@/data/listings.json';
import allSubmissions from '@/data/submissions.json';
import allAnalytics from '@/data/listing-analytics.json';
import { demandSchema, listingSchema } from '@/lib/schema';
import { type ListingAnalytics, type Submission } from '@/contexts/data-context';

export const PredictDemandTrendsInputSchema = z.object({
  timeHorizon: z.enum(['next quarter', 'next 6 months']).default('next quarter')
    .describe('The time period for which to predict demand trends.'),
});
export type PredictDemandTrendsInput = z.infer<typeof PredictDemandTrendsInputSchema>;

const PredictedHotspotSchema = z.object({
  location: z.string().describe('The predicted high-demand location (e.g., "Oragadam, Chennai").'),
  reasoning: z.string().describe('The justification for why this location is predicted to be a hotspot.'),
  growthPercentage: z.number().optional().describe('The estimated percentage growth in demand for this location.'),
});

const TrendingSpecSchema = z.object({
  specification: z.string().describe('The specification that is trending (e.g., "Ceiling Height > 45ft", "Size > 200,000 sq.ft.", "3PL Service Model").'),
  reasoning: z.string().describe('The reason behind this trend.'),
});

export const PredictDemandTrendsOutputSchema = z.object({
  marketOutlook: z.string().describe('A summary of the predicted market outlook for the upcoming period, including key trends and shifts.'),
  predictedHotspots: z.array(PredictedHotspotSchema).describe('A list of geographic locations where demand is expected to increase.'),
  trendingSpecifications: z.array(TrendingSpecSchema).describe('A list of warehouse specifications that are predicted to be in high demand.'),
});
export type PredictDemandTrendsOutput = z.infer<typeof PredictDemandTrendsOutputSchema>;

export async function predictDemandTrends(input: PredictDemandTrendsInput): Promise<PredictDemandTrendsOutput> {
  return predictDemandTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDemandTrendsPrompt',
  input: {schema: z.object({
    timeHorizon: z.string(),
    demands: z.array(demandSchema),
    listings: z.array(listingSchema),
    submissions: z.array(z.any()), // Using any to avoid complexity with nested schemas in prompt
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: `You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}} based on the historical data provided.

  Analyze the following data sets:
  1.  **Demand Data**: Records of what customers have explicitly requested. Pay attention to locations, sizes, readiness timelines, and specific priorities.
  2.  **Listings Data**: The supply side of the market. Note what types of properties are available.
  3.  **Submissions Data**: Which listings are being matched to which demands. This shows what providers think is a good fit.
  4.  **Analytics Data**: User engagement metrics like views and downloads. High engagement on certain types of properties can signal underlying, unstated demand.

  Based on your analysis, provide a predictive report. Identify:
  - **Market Outlook**: A high-level summary of what to expect.
  - **Predicted Hotspots**: Which specific locations (e.g., Oragadam, Bhiwandi) will see a surge in demand? Why?
  - **Trending Specifications**: What specific features will be most sought after? (e.g., higher ceilings, specific service models, larger sizes, particular compliance needs). Be specific.

  Your analysis should be insightful, data-driven, and actionable for a real estate brokerage. Do not simply restate the past; make forward-looking predictions.

  **Historical Data:**
  - Demands: {{{json demands}}}
  - Listings: {{{json listings}}}
  - Submissions: {{{json submissions}}}
  - Engagement Analytics: {{{json analytics}}}
  `,
});

const predictDemandTrendsFlow = ai.defineFlow(
  {
    name: 'predictDemandTrendsFlow',
    inputSchema: PredictDemandTrendsInputSchema,
    outputSchema: PredictDemandTrendsOutputSchema,
  },
  async (input) => {
    // In a real application, you might fetch this data from a live database
    // For this prototype, we're reading from the local JSON files.
    const historicalData = {
        timeHorizon: input.timeHorizon,
        demands: allDemands,
        listings: allListings,
        submissions: allSubmissions,
        analytics: allAnalytics,
    };

    const {output} = await prompt(historicalData);
    return output!;
  }
);
