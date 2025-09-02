
'use server';

/**
 * @fileOverview An AI agent that generates a property description based on given details.
 *
 * - generateListingDescription - A function that generates a property description.
 * - GenerateListingDescriptionInput - The input type for the generateListingDescription function.
 * - GenerateListingDescriptionOutput - The return type for the generateListingDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateListingDescriptionInputSchema = z.object({
  propertyId: z.string().describe('The unique identifier for the property.'),
  name: z.string().describe("The name of the warehouse or listing."),
  location: z.string().describe('The geographical location of the property.'),
  sizeSqFt: z.coerce.number().describe('The size of the property in square feet.'),
  availabilityDate: z.string().describe('The readiness of the property for occupancy (e.g., "Ready for Occupancy").'),
  serviceModel: z.enum(['Standard', '3PL', 'Both']).optional().describe('The service model (Standard warehouse, 3PL, or both).'),
  rentPerSqFt: z.number().optional().describe('The rent per square foot.'),
  buildingType: z.string().optional().describe('The type of building (e.g., "PEB").'),
  roofType: z.string().optional().describe("The material and type of the roof."),
  eveHeightMeters: z.number().optional().describe("The eve height in meters."),
});

export type GenerateListingDescriptionInput = z.infer<typeof GenerateListingDescriptionInputSchema>;

const GenerateListingDescriptionOutputSchema = z.object({
  generatedDescription: z.string().describe('The AI-generated description of the property.'),
});

export type GenerateListingDescriptionOutput = z.infer<typeof GenerateListingDescriptionOutputSchema>;

export async function generateListingDescription(input: GenerateListingDescriptionInput): Promise<GenerateListingDescriptionOutput> {
  return generateListingDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateListingDescriptionPrompt',
  input: {schema: GenerateListingDescriptionInputSchema},
  output: {schema: GenerateListingDescriptionOutputSchema},
  prompt: `You are an expert real estate copywriter specializing in industrial and warehouse properties.
  Your tone should be professional, concise, and highlight the key selling points.
  Based on the following details, write a compelling, one-paragraph description for the property.

  **Property Details:**
  - Listing Name: {{{name}}}
  - Location: {{{location}}}
  - Total Size: {{{sizeSqFt}}} sq. ft.
  - Availability: {{{availabilityDate}}}
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
