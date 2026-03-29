'use server';

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { 
    
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
  model: googleAI.model('gemini-2.0-flash'),
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
    demands: z.array(z.any()),
    listings: z.array(z.any()),
    submissions: z.array(z.any()),
    analytics: z.array(z.any()),
  })},
  output: {schema: PredictDemandTrendsOutputSchema},
  prompt: `You are a highly experienced real estate market analyst specializing in the Indian warehousing and industrial sector.
  Your task is to predict future demand trends for the {{{timeHorizon}}}.
  
  Your analysis should be based on the provided LIVE historical data from the platform, filtered by the following user-defined criteria:
  {{#if location}}- **Location Focus**: Focus specifically on **{{{location}}}**.{{/if}}
  {{#if buildingType}}- **Building Type**: Filter for **{{{buildingType}}}**.{{/if}}
  {{#if availability}}- **Availability**: Filter for **{{{availability}}}**.{{/if}}
  {{#if craneAvailable}}- **Crane**: Properties where crane is available.{{/if}}
  {{#if roofType}}- **Roof Type**: **{{{roofType}}}** roof.{{/if}}
  {{#if fireNOC}}- **Fire NOC**: Properties where Fire NOC is obtained.{{/if}}
  {{#if eveHeightMin}}- **Eve Height**: >= **{{{eveHeightMin}}}** meters.{{/if}}
  {{#if docksMin}}- **Docks**: >= **{{{docksMin}}}** docks.{{/if}}
  {{#if roofInsulation}}- **Roof Insulation**: **{{{roofInsulation}}}**.{{/if}}
  {{#if ventilation}}- **Ventilation**: **{{{ventilation}}}** type.{{/if}}
  {{#if sizeMin}}- **Size**: Between **{{{sizeMin}}}** and **{{{sizeMax}}}** sq. ft.{{/if}}

  Analyze these LIVE data sets from the platform:
  1. **Demand Data**: Customer requirements — locations, sizes, readiness timelines, priorities
  2. **Listings Data**: Current supply — property types, specifications, availability
  3. **Submissions Data**: Matched listings to demands — shows market fit
  4. **Analytics Data**: Views and downloads — signals unstated demand

  Provide a predictive report with:
  - **Market Outlook**: High-level forward-looking summary
  - **Predicted Hotspots**: Specific locations that will see demand surge with reasoning
  - **Trending Specifications**: Features most sought after with specific reasoning

  Be insightful, data-driven and actionable. Make forward-looking predictions, not historical restatements.

  **LIVE Platform Data:**
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
    let filteredListings = (input.listings || []) as any[];

    if (input.location) { const loc = input.location.toLowerCase(); filteredListings = filteredListings.filter(l => l.location?.toLowerCase().includes(loc)); }
    if (input.buildingType) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.buildingType?.some((t: string) => t.toLowerCase() === input.buildingType?.toLowerCase())); }
    if (input.warehouseModel) { filteredListings = filteredListings.filter(l => l.warehouseModel?.toLowerCase() === input.warehouseModel?.toLowerCase()); }
    if (input.availability) { filteredListings = filteredListings.filter(l => l.availabilityDate === input.availability); }
    if (input.craneAvailable !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.craneAvailable === input.craneAvailable); }
    if (input.roofType) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.roofType === input.roofType); }
    if (input.fireNOC !== undefined) { filteredListings = filteredListings.filter(l => l.certificatesAndApprovals?.fireNOC === input.fireNOC); }
    if (input.eveHeightMin !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.eveHeightMeters !== undefined && l.buildingSpecifications.eveHeightMeters >= input.eveHeightMin!); }
    if (input.docksMin !== undefined) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.numberOfDocksAndShutters !== undefined && l.buildingSpecifications.numberOfDocksAndShutters >= input.docksMin!); }
    if (input.roofInsulation) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.roofInsulation === input.roofInsulation); }
    if (input.ventilation) { filteredListings = filteredListings.filter(l => l.buildingSpecifications?.ventilation === input.ventilation); }
    if (input.sizeMin !== undefined && input.sizeMax !== undefined) { filteredListings = filteredListings.filter(l => l.sizeSqFt >= input.sizeMin! && l.sizeSqFt <= input.sizeMax!); }

    // Trim data to avoid Gemini token limits
    const trimmedListings = filteredListings.slice(0, 15).map((l: any) => ({
      listingId: l.listingId, location: l.location, sizeSqFt: l.sizeSqFt,
      availabilityDate: l.availabilityDate, warehouseModel: l.warehouseModel,
      buildingType: l.buildingSpecifications?.buildingType,
      eveHeight: l.buildingSpecifications?.eveHeightMeters,
      docks: l.buildingSpecifications?.numberOfDocksAndShutters,
      roofType: l.buildingSpecifications?.roofType,
      craneAvailable: l.buildingSpecifications?.craneAvailable,
      fireNOC: l.certificatesAndApprovals?.fireNOC,
      rentPerSqFt: l.rentPerSqFt, status: l.status,
    }));
    const trimmedDemands = (input.demands || []).slice(0, 10).map((d: any) => ({
      location: d.location, size: d.size, sizeMin: d.sizeMin, sizeMax: d.sizeMax,
      readiness: d.readiness, buildingType: d.buildingType,
      operationType: d.operationType, createdAt: d.createdAt,
    }));
    const trimmedAnalytics = (input.analytics || []).slice(0, 15).map((a: any) => ({
      listingId: a.listingId, views: a.views, downloads: a.downloads,
    }));

    const {output} = await prompt({
      ...input,
      listings: trimmedListings,
      demands: trimmedDemands,
      submissions: (input.submissions || []).slice(0, 5),
      analytics: trimmedAnalytics,
    });
    return output!;
  }
);