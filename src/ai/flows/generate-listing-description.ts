
'use server';

/**
 * @fileOverview An AI agent that generates a property description based on given details.
 *
 * - generateListingDescription - A function that generates a property description.
 * - GenerateListingDescriptionInput - The input type for the generateListingDescription function.
 * - GenerateListingDescriptionOutput - The return type for the generateListingDescription function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { GenerateListingDescriptionInputSchema } from '@/lib/schema';
import type { GenerateListingDescriptionInput } from '@/lib/schema';

const GenerateListingDescriptionOutputSchema = z.object({
  generatedDescription: z.string().describe('The AI-generated description of the property.'),
});

export type GenerateListingDescriptionOutput = z.infer<typeof GenerateListingDescriptionOutputSchema>;

export async function generateListingDescription(input: GenerateListingDescriptionInput): Promise<GenerateListingDescriptionOutput> {
  return generateListingDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingDescriptionPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: {schema: GenerateListingDescriptionInputSchema},
  output: {schema: GenerateListingDescriptionOutputSchema},
  prompt: `You are an expert real estate copywriter specializing in industrial and warehouse properties.
  Your tone should be professional, concise, and highlight the key selling points.
  Based on the following details, write a compelling, one-paragraph description for the property.

  **Property Details:**
  {{#if name}}- Listing Name: {{{name}}}{{/if}}
  - Location: {{{location}}}
  - Total Size: {{{sizeSqFt}}} sq. ft.
  - Availability: {{{availabilityDate}}}
  {{#if developerName}}- Listed By: {{{developerName}}}{{/if}}
  {{#if rentPerSqFt}}- Quoted Rent: ₹{{{rentPerSqFt}}} per sq. ft.{{/if}}
  {{#if serviceModel}}- Service Model: {{{serviceModel}}}{{/if}}
  {{#if buildingType}}- Building Type: {{{buildingType}}}{{/if}}
  {{#if roofType}}- Roof Type: {{{roofType}}}{{/if}}
  {{#if eveHeightMeters}}- Eve Height: {{{eveHeightMeters}}} meters{{/if}}

  Focus on creating a clear, attractive summary that a potential tenant can quickly understand.
  `,
});

const generateListingDescriptionFlow = ai.defineFlow(
  {
    name: 'generateListingDescriptionFlow',
    inputSchema: GenerateListingDescriptionInputSchema,
    outputSchema: GenerateListingDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
