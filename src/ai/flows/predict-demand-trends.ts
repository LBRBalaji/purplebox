
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
  model: googleAI.model('gemini-1.0-pro'),
  input: {schema: z.object({
    timeHorizon: z.string(),
    location: z.string().optional(),
    buildingType: z.string().optional(),
    warehouseModel: z.string().optional(),
    availability: z.string().optional(),
    craneAvailable: z.boolean().optional(),
    roofType: z.string().optional(),
    fireNOC: z.boolean().optional(),
    eveHeightMin: z.number().optional(),
    docksMin: z.number().optional(),
    roofInsulation: z.string().optional(),
    ventilation: z.string().optional(),
    sizeMin: z.number().optional(),
    sizeMax: z.number().optional(),
    demands: z.array(demandSchema),
    listings: z.array(listingSchema),
    submissions: z.array(z.any()), // Using any to avoid complexity with nested schemas in prompt
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: `You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}}.
  
  Your analysis should be based on the provided historical data, filtered by the following user-defined criteria:
  {{#if location}}- **Location Focus**: The analysis should specifically focus on the **{{{location}}}** area.{{/if}}
  {{#if buildingType}}- **Building Type**: Filter for **{{{buildingType}}}** building types.{{/if}}
  {{#if warehouseModel}}- **Warehouse Model**: Filter for **{{{warehouseModel}}}** warehouse models.{{/if}}
  {{#if availability}}- **Availability**: Filter for properties with status **{{{availability}}}**.{{/if}}
  {{#if craneAvailable}}- **Crane**: Filter for properties where a crane is available.{{/if}}
  {{#if roofType}}- **Roof Type**: Filter for properties with a **{{{roofType}}}** roof.{{/if}}
  {{#if fireNOC}}- **Fire NOC**: Filter for properties where Fire NOC is obtained.{{/if}}
  {{#if eveHeightMin}}- **Eve Height**: Filter for properties with eve height >= **{{{eveHeightMin}}}** meters.{{/if}}
  {{#if docksMin}}- **Docks**: Filter for properties with >= **{{{docksMin}}}** docks.{{/if}}
  {{#if roofInsulation}}- **Roof Insulation**: Filter for properties with **{{{roofInsulation}}}** roof insulation.{{/if}}
  {{#if ventilation}}- **Ventilation**: Filter for properties with **{{{ventilation}}}** type.{{/if}}
  {{#if sizeMin}}- **Size**: Filter for properties with size between **{{{sizeMin}}}** and **{{{sizeMax}}}** sq. ft.{{/if}}

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
    let filteredListings = allListings as ListingSchema[];

    if (input.location) {
        const loc = input.location.toLowerCase();
        filteredListings = filteredListings.filter(l => l.location.toLowerCase().includes(loc));
    }
    
    if (input.buildingType) {
        filteredListings = filteredListings.filter(l => 
            l.buildingSpecifications.buildingType?.some(type => type.toLowerCase() === input.buildingType?.toLowerCase())
        );
    }

    if (input.warehouseModel) {
        filteredListings = filteredListings.filter(l => l.warehouseModel?.toLowerCase() === input.warehouseModel?.toLowerCase());
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

    if (input.eveHeightMin !== undefined) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.eveHeightMeters !== undefined && l.buildingSpecifications.eveHeightMeters >= input.eveHeightMin!);
    }

    if (input.docksMin !== undefined) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.numberOfDocksAndShutters !== undefined && l.buildingSpecifications.numberOfDocksAndShutters >= input.docksMin!);
    }

    if (input.roofInsulation) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.roofInsulation === input.roofInsulation);
    }

    if (input.ventilation) {
        filteredListings = filteredListings.filter(l => l.buildingSpecifications.ventilation === input.ventilation);
    }
    
    if (input.sizeMin !== undefined && input.sizeMax !== undefined) {
      filteredListings = filteredListings.filter(l => l.sizeSqFt >= input.sizeMin! && l.sizeSqFt <= input.sizeMax!);
    }


    const historicalData = {
        ...input,
        demands: allDemands,
        listings: filteredListings,
        submissions: allSubmissions,
        analytics: allAnalytics,
    };

    const {output} = await prompt(historicalData);
    return output!;
  }
);
