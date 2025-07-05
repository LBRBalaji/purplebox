// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI agent that generates a property description based on given details.
 *
 * - generatePropertyDescription - A function that generates a property description.
 * - GeneratePropertyDescriptionInput - The input type for the generatePropertyDescription function.
 * - GeneratePropertyDescriptionOutput - The return type for the generatePropertyDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePropertyDescriptionInputSchema = z.object({
  propertyId: z.string().describe('The unique identifier for the property.'),
  propertyGeoLocation: z.string().describe('The geographical location of the property.'),
  size: z.string().describe('The size of the property (e.g., in square feet).'),
  floor: z.string().describe('The floor of the property, if it is in a building.'),
  readinessToOccupy: z.enum(['Immediate', 'Within 3 months', 'Within 6 months', 'BTS']).describe('The readiness of the property for occupancy.'),
  siteType: z.enum(['Standalone', 'Part of Industrial Park', 'Part of Commercial Project']).describe('The type of site.'),
  safety: z.string().describe('Safety features of the property (e.g., compounded fully, partially, or 3 sides).'),
  ceilingHeight: z.string().describe('The ceiling height of the property.'),
  rentPerSft: z.string().describe('The rent per square foot.'),
  rentalSecurityDeposit: z.string().describe('The rental security deposit (number of months).'),
  userType: z.enum(['Developer', 'Agent', 'Owner']).describe('The type of user submitting the property.'),
  userName: z.string().describe('The name of the user submitting the property.'),
  userCompanyName: z.string().describe('The company name of the user submitting the property.'),
  userPhoneNumber: z.string().describe('The phone number of the user submitting the property.'),
  userEmail: z.string().describe('The email of the user submitting the property.'),
  approvalStatus: z.enum(['Obtained', 'Applied For', 'To Apply', 'Un-Approved']).describe('The approval status of the property.'),
  approvalAuthority: z.enum(['DTCP', 'CMDA', 'BDA']).describe('The approval authority for the property.'),
  installedCapacity: z.string().describe('The installed electricity capacity (kva/mva).'),
  availablePower: z.string().describe('The available power for the property.'),
  genSetBackup: z.enum(['Available', 'Can be provided']).describe('Whether a generator set backup is available.'),
  fireHydrant: z.enum(['Installed', 'Can be provided']).describe('Whether a fire hydrant is installed or can be provided.'),
  fireNoc: z.enum(['Obtained', 'Applied For', 'To Apply']).describe('The fire safety NOC status.'),
  docks: z.string().describe('The number of docks available.'),
  canopy: z.enum(['Installed', 'Can be provided']).describe('Whether a canopy is installed or can be provided.'),
  additionalInformation: z.string().describe('Any additional information about the property.'),
});

export type GeneratePropertyDescriptionInput = z.infer<typeof GeneratePropertyDescriptionInputSchema>;

const GeneratePropertyDescriptionOutputSchema = z.object({
  propertyDescription: z.string().describe('The AI-generated description of the property.'),
});

export type GeneratePropertyDescriptionOutput = z.infer<typeof GeneratePropertyDescriptionOutputSchema>;

export async function generatePropertyDescription(input: GeneratePropertyDescriptionInput): Promise<GeneratePropertyDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GeneratePropertyDescriptionInputSchema},
  output: {schema: GeneratePropertyDescriptionOutputSchema},
  prompt: `You are an expert commercial real estate copywriter.

  Based on the following details, write a compelling description of the property.

  Property ID: {{{propertyId}}}
  Geo Location: {{{propertyGeoLocation}}}
  Size: {{{size}}}
  Floor: {{{floor}}}
  Readiness to Occupy: {{{readinessToOccupy}}}
  Site Type: {{{siteType}}}
  Safety: {{{safety}}}
  Ceiling Height: {{{ceilingHeight}}}
  Rent Per Sft: {{{rentPerSft}}}
  Rental Security Deposit: {{{rentalSecurityDeposit}}}
  User Type: {{{userType}}}
  User Name: {{{userName}}}
  User Company Name: {{{userCompanyName}}}
  User Phone Number: {{{userPhoneNumber}}}
  User Email: {{{userEmail}}}
  Approval Status: {{{approvalStatus}}}
  Approval Authority: {{{approvalAuthority}}}
  Installed Capacity: {{{installedCapacity}}}
  Available Power: {{{availablePower}}}
  Gen-set Backup: {{{genSetBackup}}}
  Fire Hydrant: {{{fireHydrant}}}
  Fire NOC: {{{fireNoc}}}
  Docks: {{{docks}}}
  Canopy: {{{canopy}}}
  Additional Information: {{{additionalInformation}}}
  `,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GeneratePropertyDescriptionInputSchema,
    outputSchema: GeneratePropertyDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
