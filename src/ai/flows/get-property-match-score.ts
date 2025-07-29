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
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert Commercial Real Estate Analyst. Your task is to calculate a detailed match score between a property demand and a submitted property.

You must provide an overall score, a breakdown for location, size, and features, and a justification. The scores must be between 0.0 and 1.0.

CRUCIAL INSTRUCTIONS:
The user has specified certain criteria as "Non-Compromisable". You must strictly adhere to these.
{{#if demand.preferences.nonCompromisable}}
The following items are non-compromisable: {{#each demand.preferences.nonCompromisable}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

- If 'size' is non-compromisable and the property size is not within a 10% tolerance of the demanded size, the 'size' score and 'overallScore' must be very low (less than 0.2).
- If 'location' is non-compromisable, you must assume the provided property is outside the required radius. The 'location' score and 'overallScore' must be very low (less than 0.2).
- If 'ceilingHeight' is non-compromisable and the property's ceiling height is less than what is demanded, the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'docks' is non-compromisable and the property has fewer docks than demanded, the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'readiness' is non-compromisable, evaluate if the property's readiness meets the demand's required timeline. For example, a demand for 'Immediate' readiness is not met by a property available 'Within 6 months'. If it doesn't meet the requirement, the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'approvals' is non-compromisable and the property's 'approvalStatus' is not 'Obtained', the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'fireNoc' is non-compromisable and the property's 'fireNoc' is not 'Obtained', the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'power' is non-compromisable, you must evaluate if the property's 'availablePower' seems sufficient based on the demand description. If it seems insufficient, the 'features' score and 'overallScore' must be very low (less than 0.2).
- If 'fireSafety' is non-compromisable and the property's 'fireHydrant' is not 'Installed', the 'features' score and 'overallScore' must be very low (less than 0.2).
{{else}}
There are no non-compromisable items. Evaluate the match based on a holistic assessment of all factors.
{{/if}}

Analyze the following data:

**PROPERTY DEMAND**
- Demand ID: {{{demand.demandId}}}
- Property Type: {{{demand.propertyType}}}
- Location: Within {{{demand.radius}}} km of {{{demand.location}}}
- Size: {{{demand.size}}} Sq. Ft.
- Required Ceiling Height (ft): {{{demand.ceilingHeight}}}
- Required Docks: {{{demand.docks}}}
- Required Readiness: {{{demand.readiness}}}
- Description: {{{demand.description}}}
- Non-Compromisable Items: {{#if demand.preferences.nonCompromisable}}{{#each demand.preferences.nonCompromisable}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

**SUBMITTED PROPERTY**
- Property ID: {{{property.propertyId}}}
- Site Type: {{{property.siteType}}}
- Location: {{{property.propertyGeoLocation}}} (Assume this is just a text label, not for distance calculation)
- Size: {{{property.size}}} Sq. Ft.
- Ceiling Height: {{{property.ceilingHeight}}} ft
- Docks: {{{property.docks}}}
- Readiness to Occupy: {{{property.readinessToOccupy}}}
- Available Power: {{{property.availablePower}}}
- Approval Status: {{{property.approvalStatus}}}
- Fire NOC Status: {{{property.fireNoc}}}
- Fire Hydrant Status: {{{property.fireHydrant}}}
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
