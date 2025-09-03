
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
    serviceModel: z.string().optional(),
    availability: z.string().optional(),
    craneAvailable: z.boolean().optional(),
    roofType: z.string().optional(),
    fireNOC: z.boolean().optional(),
    demands: z.array(demandSchema),
    listings: z.array(listingSchema),
    submissions: z.array(z.any()), // Using any to avoid complexity with nested schemas in prompt
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: `You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}}.
  
  Your analysis should be based on the provided historical data, filtered by the following user-defined criteria:
  {{#if location}}
  - **Location Focus**: The analysis should specifically focus on the **{{{location}}}** area.
  {{/if}}
  {{#if buildingType}}
  - **Building Type**: Filter for **{{{buildingType}}}** building types.
  {{/if}}
  {{#if serviceModel}}
  - **Service Model**: Filter for **{{{serviceModel}}}** service models.
  {{/if}}
  {{#if availability}}
  - **Availability**: Filter for properties with status **{{{availability}}}**.
  {{/if}}
  {{#if craneAvailable}}
  - **Crane**: Filter for properties where a crane is available.
  {{/if}}
  {{#if roofType}}
  - **Roof Type**: Filter for properties with a **{{{roofType}}}** roof.
  {{/if}}
  {{#if fireNOC}}
  - **Fire NOC**: Filter for properties where Fire NOC is obtained.
  {{/if}}

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
    let filteredListings = allListings as ListingSchema[];

    if (input.location) {
        const loc = input.location.toLowerCase();
        filteredDemands = filteredDemands.filter(d => d.locationName?.toLowerCase().includes(loc));
        filteredListings = filteredListings.filter(l => l.location.toLowerCase().includes(loc));
    }
    
    if (input.buildingType) {
        const bt = input.buildingType.toLowerCase();
        filteredDemands = filteredDemands.filter(d => d.buildingType?.toLowerCase() === bt);
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.buildingType?.toLowerCase().includes(bt));
    }

    if (input.serviceModel) {
        const sm = input.serviceModel.toLowerCase();
         filteredListings = filteredListings.filter(l => l.serviceModel?.toLowerCase() === sm);
    }
    
    if (input.availability) {
        filteredListings = filteredListings.filter(l => l.availabilityDate === input.availability);
    }

    if (input.craneAvailable !== undefined) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.craneAvailable === input.craneAvailable);
    }

    if (input.roofType) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.roofType === input.roofType);
    }

    if (input.fireNOC !== undefined) {
        filteredListings = filteredListings.filter(l => l.certificatesAndApprovals.fireNOC === input.fireNOC);
    }


    const historicalData = {
        ...input,
        demands: filteredDemands,
        listings: filteredListings,
        submissions: allSubmissions,
        analytics: allAnalytics,
    };

    const {output} = await prompt(historicalData);
    return output!;
  }
);
