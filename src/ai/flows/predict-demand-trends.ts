// src/ai/flows/predict-demand-trends.ts
'use server';

/**
 * @fileOverview An AI agent that analyzes historical data to predict future warehouse demand trends.
 * 
 * - predictDemandTrends - A function that generates predictive analytics.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import allDemands from '@/data/demands.json';
import allListings from '@/data/listings.json';
import allSubmissions from '@/data/submissions.json';
import allAnalytics from '@/data/listing-analytics.json';
import { 
    demandSchema, 
    listingSchema, 
    PredictDemandTrendsInputSchema, 
    PredictDemandTrendsOutputSchema,
    type PredictDemandTrendsInput,
    type PredictDemandTrendsOutput,
} from '@/lib/schema';


export async function predictDemandTrends(input: PredictDemandTrendsInput): Promise<PredictDemandTrendsOutput> {
  return predictDemandTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDemandTrendsPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: z.object({
    timeHorizon: z.string(),
    location: z.string().optional(),
    buildingType: z.string().optional(),
    demands: z.array(demandSchema),
    listings: z.array(listingSchema),
    submissions: z.array(z.any()), // Using any to avoid complexity with nested schemas in prompt
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: `You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}}.
  {{#if location}}The analysis should specifically focus on the **{{{location}}}** area.{{/if}}
  {{#if buildingType}}The analysis should be filtered for **{{{buildingType}}}** building types.{{/if}}

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
    // We can filter the data based on the input before sending it to the model.
    let filteredDemands = allDemands;
    let filteredListings = allListings;

    if (input.location) {
        const loc = input.location.toLowerCase();
        filteredDemands = filteredDemands.filter(d => d.locationName?.toLowerCase().includes(loc));
        filteredListings = filteredListings.filter(l => l.location.toLowerCase().includes(loc));
    }
    
    if (input.buildingType && input.buildingType !== 'Any') {
        const bt = input.buildingType.toLowerCase();
        filteredDemands = filteredDemands.filter(d => d.buildingType?.toLowerCase() === bt);
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.buildingType?.toLowerCase().includes(bt));
    }


    const historicalData = {
        timeHorizon: input.timeHorizon,
        location: input.location,
        buildingType: input.buildingType,
        demands: filteredDemands,
        listings: filteredListings,
        submissions: allSubmissions,
        analytics: allAnalytics,
    };

    const {output} = await prompt(historicalData);
    return output!;
  }
);
