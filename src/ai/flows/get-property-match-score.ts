'use server';
/**
 * @fileOverview An AI agent that calculates a match score between a property and a demand.
 *
 * - getPropertyMatchScore - A function that handles the matching process.
 * - GetPropertyMatchScoreInput - The input type for the getPropertyMatchScore function.
 * - GetPropertyMatchScoreOutput - The return type for the getPropertyMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { demandSchema, propertySchema } from '@/lib/schema';

const GetPropertyMatchScoreInputSchema = z.object({
  demand: demandSchema.describe("The user's property demand details, including preferences."),
  property: propertySchema.describe("The details of the property being submitted for matching."),
});
export type GetPropertyMatchScoreInput = z.infer<typeof GetPropertyMatchScoreInputSchema>;

const GetPropertyMatchScoreOutputSchema = z.object({
  overallScore: z.number().min(0).max(1).describe('The overall match score from 0 to 1, where 1 is a perfect match.'),
  scoreBreakdown: z.object({
      location: z.number().min(0).max(1).describe('Score for how well the property location matches the demand criteria (0-1).'),
      size: z.number().min(0).max(1).describe('Score for how well the property size matches the demand (0-1).'),
      features: z.number().min(0).max(1).describe('Score for how well the property amenities and other features match the demand (0-1).'),
    }).describe('A breakdown of scores for different sections.'),
  justification: z.string().describe('A detailed explanation for the calculated scores, highlighting strengths and weaknesses of the match.'),
});
export type GetPropertyMatchScoreOutput = z.infer<typeof GetPropertyMatchScoreOutputSchema>;

export async function getPropertyMatchScore(input: GetPropertyMatchScoreInput): Promise<GetPropertyMatchScoreOutput> {
  return getPropertyMatchScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPropertyMatchScorePrompt',
  input: {schema: GetPropertyMatchScoreInputSchema},
  output: {schema: GetPropertyMatchScoreOutputSchema},
  prompt: `You are an expert Commercial Real Estate Analyst. Your task is to calculate a detailed match score between a property demand and a submitted property.

You must provide an overall score, a breakdown for location, size, and features, and a justification. The scores must be between 0.0 and 1.0.

CRUCIAL INSTRUCTIONS:
The user has specified certain criteria as "Non-Compromisable".
- If 'isPropertyTypeNonCompromisable' is true, and the property types do not match, the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'isSizeNonCompromisable' is true, and the property size is not within a 10% tolerance of the demanded size, the 'size' score and 'overallScore' must be very low (less than 0.2).
- If 'isLocationNonCompromisable' is true, you must assume the provided property is outside the required radius. The 'location' score and 'overallScore' must be very low (less than 0.2). I will not provide geo-coordinates for the property, so you must trust this instruction if the flag is set.

Analyze the following data:

**PROPERTY DEMAND**
- Demand ID: {{{demand.demandId}}}
- Property Type: {{{demand.propertyType}}}
- Location: Within {{{demand.radius}}} km of {{{demand.location}}}
- Size: {{{demand.size}}} Sq. Ft.
- Description: {{{demand.description}}}
- Preferences:
  - Property Type Non-Compromisable: {{{demand.preferences.isPropertyTypeNonCompromisable}}}
  - Size Non-Compromisable: {{{demand.preferences.isSizeNonCompromisable}}}
  - Location Non-Compromisable: {{{demand.preferences.isLocationNonCompromisable}}}

**SUBMITTED PROPERTY**
- Property ID: {{{property.propertyId}}}
- Site Type: {{{property.siteType}}}
- Location: {{{property.propertyGeoLocation}}} (Assume this is just a text label, not for distance calculation)
- Size: {{{property.size}}} Sq. Ft.
- Ceiling Height: {{{property.ceilingHeight}}} ft
- Docks: {{{property.docks}}}
- Power: {{{property.availablePower}}}
- Additional Info: {{{property.additionalInformation}}}

Based on this information, provide your analysis as a JSON object matching the output schema. Be concise but clear in your justification.
`,
});

const getPropertyMatchScoreFlow = ai.defineFlow(
  {
    name: 'getPropertyMatchScoreFlow',
    inputSchema: GetPropertyMatchScoreInputSchema,
    outputSchema: GetPropertyMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
