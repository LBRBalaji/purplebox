
// src/ai/flows/analyze-property-suitability.ts
'use server';

/**
 * @fileOverview Analyzes property features against demand criteria to suggest suitable matches.
 *
 * - analyzePropertySuitability - A function that analyzes property suitability based on input.
 * - AnalyzePropertySuitabilityInput - The input type for the analyzePropertySuitability function.
 * - AnalyzePropertySuitabilityOutput - The return type for the analyzePropertySuitability function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzePropertySuitabilityInputSchema = z.object({
  demandCriteria: z
    .string()
    .describe('The criteria for the property demand, including desired features and location.'),
  propertyFeatures: z
    .string()
    .describe('The features of the property being evaluated, including size, location, and amenities.'),
});

export type AnalyzePropertySuitabilityInput = z.infer<
  typeof AnalyzePropertySuitabilityInputSchema
>;

const AnalyzePropertySuitabilityOutputSchema = z.object({
  suitabilityScore: z
    .number()
    .describe(
      'A score from 0 to 1 indicating the suitability of the property for the given demand criteria.'
    ),
  justification: z
    .string()
    .describe(
      'A justification for the suitability score, explaining why the property is or is not a good match.'
    ),
});

export type AnalyzePropertySuitabilityOutput = z.infer<
  typeof AnalyzePropertySuitabilityOutputSchema
>;

export async function analyzePropertySuitability(
  input: AnalyzePropertySuitabilityInput
): Promise<AnalyzePropertySuitabilityOutput> {
  return analyzePropertySuitabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePropertySuitabilityPrompt',
  model: googleAI.model('gemini-1.5-flash:latest'),
  input: {schema: AnalyzePropertySuitabilityInputSchema},
  output: {schema: AnalyzePropertySuitabilityOutputSchema},
  prompt: `You are an AI assistant that analyzes property features against demand criteria.

You will be provided with demand criteria and property features. You will assess the suitability of the property based on the criteria and provide a suitability score between 0 and 1, as well as a justification for the score.

Demand Criteria: {{{demandCriteria}}}
Property Features: {{{propertyFeatures}}}

Consider these factors when determining suitability:
- Location
- Size
- Amenities
- Other relevant features

Respond with a JSON object containing the suitability score and justification.
`,
});

const analyzePropertySuitabilityFlow = ai.defineFlow(
  {
    name: 'analyzePropertySuitabilityFlow',
    inputSchema: AnalyzePropertySuitabilityInputSchema,
    outputSchema: AnalyzePropertySuitabilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
