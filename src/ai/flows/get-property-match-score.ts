
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
import { demandSchema, propertySchemaBase } from '@/lib/schema';

const GetPropertyMatchScoreInputSchema = z.object({
  demand: demandSchema.describe("The user's property demand details, including preferences."),
  property: propertySchemaBase.describe("The details of the property being submitted for matching."),
});
export type GetPropertyMatchScoreInput = z.infer<typeof GetPropertyMatchScoreInputSchema>;

const GetPropertyMatchScoreOutputSchema = z.object({
  overallScore: z.number().min(0).max(1).describe('The overall weighted match score from 0 to 1, where 1 is a perfect match.'),
  scoreBreakdown: z.object({
      location: z.number().min(0).max(1).describe('Score for location match (0-1). 1.0 if confirmed by provider.'),
      size: z.number().min(0).max(1).describe('Score for how well the property size matches the demand (0-1).'),
      commercials: z.number().min(0).max(1).describe('Score for the commercial terms (rent, deposit) (0-1). Assumed 0.9 if no specifics from customer.'),
      power: z.number().min(0).max(1).describe('Score for the power infrastructure (0-1). Assumed 0.9 if no specifics from customer.'),
      fireSafety: z.number().min(0).max(1).describe('Score for fire safety compliance (0-1). Assumed 0.9 if no specifics from customer.'),
      approvals: z.number().min(0).max(1).describe('Score for statutory approvals (0-1). Assumed 0.9 if no specifics from customer.'),
      amenities: z.number().min(0).max(1).describe('Score for amenities like docks and canopy (0-1).'),
    }).describe('A breakdown of scores for different categories.'),
  justification: z.string().describe('A detailed explanation for the calculated scores, highlighting strengths and weaknesses of the match for each category.'),
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

You must provide an overall score, a breakdown for multiple categories, and a detailed justification. The scores must be between 0.0 and 1.0.

**GENERAL SCORING GUIDELINES:**

- **Non-Compromisable Items & 'Must to have':** If a customer marks an item as "non-compromisable" or a preference as "Must to have", any significant deviation in the property should lead to a very low score **for that specific category**. This applies to ALL sections, including Essentials, Optionals (like Crane), and Operations (like ETP). However, do not let it drag the entire overall score to zero if other categories are a good match.
- **No Customer Preference:** If the customer has NOT specified a requirement for a category (e.g., they did not specify 'fireNoc' as a priority or mention it in the description), you should give a high score (e.g., 0.9-1.0) to a property that has positive attributes in that category (e.g., Fire NOC is "Obtained"). This rewards well-equipped properties. Assume a default score of 0.9 for categories like Commercials, Power, Fire Safety, and Approvals if no customer preference is stated.
- **Justification:** Your justification MUST be detailed and address each category separately. Explain the "why" behind each score.

**CATEGORY-SPECIFIC SCORING RULES:**

1.  **Location Score:**
    *   If the property provider has set \`isLocationConfirmed\` to \`true\`, the **location score must be 1.0**. The justification should state that the provider has confirmed the location match.
    *   If \`isLocationConfirmed\` is \`false\`, the score must be very low (0.1), as the location is unverified.

2.  **Size Score:**
    *   If the customer specified a min/max size range, check if the property size falls within it. If not, the score is low. If it does, score it based on how close it is to their ideal 'size' field.
    *   If no range is given, use the direct ratio: \`min(propertySize, demandSize) / max(propertySize, demandSize)\`.
    *   Consider the 'sizeVariationPercentage'. A property just outside the primary 'size' but within the variation percentage should still get a decent score.

3.  **Amenities Score (Blended):**
    *   This is a blended score. If the customer requires a specific number of docks (e.g., 12) and the property has fewer (e.g., 11), the score for that item **must be calculated proportionally** as \`propertyDocks / demandDocks\` (11/12 = 0.92). A score of 9/12 would be 0.75.
    *   If the customer requires a specific ceiling height and the property is below, score it **proportionally** as \`propertyHeight / demandHeight\` (e.g., 38ft provided vs 40ft required is 38/40 = 0.95 score). Note the units (ft/m).
    *   If the customer has **no** requirement for docks or ceiling height, a property with a reasonable number (e.g., >5 docks, >30ft ceiling) should get a high score (0.9-1.0).
    *   **Building Type:** If the customer specifies a building type (PEB/RCC) and the property's site type doesn't align, penalize the score. If they choose RCC and have a floor preference, check if the property's floor matches. A mismatch on a non-compromisable building type should result in a low amenities score.
    *   **Crane:** If a crane is required (especially if non-compromisable), a property without one should receive a very low score for this part of the amenities calculation. If the property has a crane, score it based on how well its capacity, span, and height match the requirements.
    *   Combine these proportional scores to produce the final amenities score.

4.  **Fire Safety Score:**
    *   If the customer marks 'fireNoc' or 'fireSafety' as "Must to have", a property with "Obtained" Fire NOC and "Installed" Fire Hydrant gets a 1.0. "Applied For" gets ~0.6. "To Apply" gets ~0.3. "Good to have" can be more lenient.
    *   If the customer has **no** preference, a property with "Obtained" NOC still gets a high score (1.0).

5.  **Approvals Score:**
    *   Similar to Fire Safety. If the customer marks 'approvals' as "Must to have", "Obtained" status gets 1.0. "Applied For" gets ~0.6. "To Apply" or "Un-Approved" gets a low score.
    *   For **Operations** (Manufacturing), if there are specific requirements (like MPCB/EC category or ETP details) and the provider's response is "No," this should result in a low score for this category. "Acceptable" should be a high score, and "May Be" should be moderate.
    *   If the customer has **no** preference, a property with "Obtained" approvals gets a high score (1.0).

6.  **Power Score:**
    *   If the customer specifies a min/max power requirement, check if the property's 'availablePower' falls within that range. If no specific requirement, assume a high score (0.9) for any specified available power.

7.  **Commercials Score:**
    *   This is subjective. If no customer preference, assume 0.9. If customer mentions "budget-friendly", a lower rent/sft should get a higher score.

8.  **Overall Score:**
    *   The \`overallScore\` **MUST be the simple mathematical average** of all the category scores in the \`scoreBreakdown\`. Do not use a complex weighted average. Your final justification should briefly state this is an average and point out the highest and lowest scoring categories.

**Analyze the following data:**

**PROPERTY DEMAND**
- Demand ID: {{{demand.demandId}}}
- Operation Type: {{{demand.operationType}}}
- Location: Within {{{demand.radius}}} km of {{{demand.locationName}}}
- Size: {{demand.size}} Sq. Ft. (Range: {{#if demand.sizeMin}}{{demand.sizeMin}} - {{demand.sizeMax}}{{else}}Not Specified{{/if}}, Variation: +/-{{demand.sizeVariationPercentage}}%)
- Building Type: {{demand.buildingType}} (Floor Pref: {{#if demand.floorPreference}}{{demand.floorPreference}}{{else}}N/A{{/if}})
- Required Ceiling Height ({{demand.ceilingHeightUnit}}): {{#if demand.ceilingHeight}}{{{demand.ceilingHeight}}}{{else}}Not Specified{{/if}}
- Required Docks: {{#if demand.docks}}{{{demand.docks}}}{{else}}Not Specified{{/if}}
- Required Readiness: {{{demand.readiness}}}
- Power Requirement (kVA): {{#if demand.powerMin}}{{demand.powerMin}} - {{demand.powerMax}}{{else}}Not Specified{{/if}}
- Crane Required: {{#if demand.optionals.crane.required}}Yes{{else}}No{{/if}}
  {{#if demand.optionals.crane.required}}
  - Crane Type: {{demand.optionals.crane.type}}
  - Crane Capacity: {{demand.optionals.crane.capacity}} Tons
  {{/if}}
- Description: {{{demand.description}}}
- **Priorities:**
  - Non-Compromisable Items: {{#if demand.preferences.nonCompromisable}}{{#each demand.preferences.nonCompromisable}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
  - Approvals: {{demand.preferences.approvals}}
  - Fire NOC: {{demand.preferences.fireNoc}}
  - Fire Safety: {{demand.preferences.fireSafety}}
- **Operational Needs:**
  {{#if demand.operations.etpDetails}}
  - ETP Details: {{demand.operations.etpDetails}}
  {{/if}}
  {{#if demand.operations.mpcbEcCategory}}
  - MPCB/EC Category: {{demand.operations.mpcbEcCategory}}
  {{/if}}

**SUBMITTED PROPERTY**
- Property ID: {{{property.propertyId}}}
- Location Confirmed by Provider: {{{property.isLocationConfirmed}}}
- Site Type: {{{property.siteType}}} (Align with PEB/RCC)
- Floor: {{{property.floor}}}
- Size: {{{property.size}}} Sq. Ft.
- Ceiling Height: {{{property.ceilingHeight}}} ft
- Docks: {{{property.docks}}}
- Readiness to Occupy: {{{property.readinessToOccupy}}}
- Rent Per Sft: ₹{{{property.rentPerSft}}}
- Available Power: {{{property.availablePower}}}
- Approval Status: {{{property.approvalStatus}}}
- Fire NOC Status: {{{property.fireNoc}}}
- Fire Hydrant Status: {{{property.fireHydrant}}}
- Canopy Status: {{{property.canopy}}}
- Crane Provided: {{#if property.optionals.crane.required}}Yes{{else}}No{{/if}}
  {{#if property.optionals.crane.required}}
  - Crane Type: {{property.optionals.crane.type}}
  - Crane Capacity: {{property.optionals.crane.capacity}} Tons
  {{/if}}
- **Operations Compliance:**
  {{#if property.operations.mpcbEcCategory}}
  - MPCB/EC Category Compliance: {{property.operations.mpcbEcCategory}}
  {{/if}}
  {{#if property.operations.etpDetails}}
  - ETP Compliance: {{property.operations.etpDetails}}
  {{/if}}
- Additional Info: {{{property.additionalInformation}}}

Based on this information, provide your analysis as a JSON object matching the output schema.
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

