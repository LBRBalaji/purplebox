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

**SCORING GUIDELINES:**

1.  **Location Score:**
    *   The property provider has a field \`isLocationConfirmed\`. If \`isLocationConfirmed\` is \`true\`, it means the provider confirms their property is within the customer's desired radius. In this case, the **location score should be very high (e.g., 0.9 to 1.0)**. Do not penalize the location if this is confirmed.

2.  **Size Score:**
    *   Calculate the percentage difference between the demanded size and the property size.
    *   If 'size' is a non-compromisable priority:
        *   If the property size is within a **15% tolerance** (either larger or smaller) of the demanded size, the score should still be high (e.g., > 0.85).
        *   If the property size is outside the 15% tolerance, the score should be very low (< 0.2).
    *   If 'size' is NOT a non-compromisable priority, be more lenient. A 20-25% difference might still result in a score of 0.6-0.7.

3.  **Features Score:**
    *   This score is a blend of all other features (Ceiling Height, Docks, Readiness, Approvals, Fire Safety, etc.).
    *   If a feature (e.g., 'docks', 'ceilingHeight') is a non-compromisable priority:
        *   If the property **meets or exceeds** the requirement (e.g., has same or more docks), that part of the feature score should be 1.0.
        *   If the property is **slightly below** the requirement (e.g., 11 docks instead of 12), the score should be penalized, but not to zero. A score of 0.7-0.8 for that specific feature is reasonable.
        *   If the property is **significantly below** the requirement, the score for that feature should be very low (< 0.2).
    *   Evaluate all features and create a blended score.

4.  **Overall Score & Justification:**
    *   The overall score should be a weighted average of the Location, Size, and Features scores.
    *   Your justification MUST be clear and logical. Explain WHY you gave each score, referencing the specific numbers (e.g., "The size score is 0.9 because the 92,000 sq ft property is within the 15% tolerance of the 100,000 sq ft demand."). If a score is low, explain the exact reason based on the provided numbers and priorities.

**Analyze the following data:**

**PROPERTY DEMAND**
- Demand ID: {{{demand.demandId}}}
- Property Type: {{{demand.propertyType}}}
- Location: Within {{{demand.radius}}} km of {{{demand.locationName}}}
- Size: {{{demand.size}}} Sq. Ft.
- Required Ceiling Height (ft): {{{demand.ceilingHeight}}}
- Required Docks: {{{demand.docks}}}
- Required Readiness: {{{demand.readiness}}}
- Description: {{{demand.description}}}
- Non-Compromisable Items: {{#if demand.preferences.nonCompromisable}}{{#each demand.preferences.nonCompromisable}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

**SUBMITTED PROPERTY**
- Property ID: {{{property.propertyId}}}
- Location Confirmed by Provider: {{{property.isLocationConfirmed}}}
- Site Type: {{{property.siteType}}}
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
