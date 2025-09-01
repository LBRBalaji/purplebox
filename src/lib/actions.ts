
"use server";

import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from "@/ai/flows/generate-property-description";
import { improvePropertyDemandDescription, type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";
import { getPropertyMatchScore, type GetPropertyMatchScoreOutput, type GetPropertyMatchScoreInput } from "@/ai/flows/get-property-match-score";
import { getWarehouses, type GetWarehousesInput, type GetWarehousesOutput } from "@/ai/flows/get-warehouses";
import { type PropertySchema, type DemandSchema, type WarehouseSchema, type ListingSchema } from "./schema";

export async function getImprovedDemandDescriptionAction(
  input: ImprovePropertyDemandDescriptionInput
): Promise<{ improvedDescription?: string; error?: string }> {
  try {
    const result = await improvePropertyDemandDescription(input);
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error("Error improving demand description:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while improving the description." };
  }
}

export async function logDemandAction(
  data: DemandSchema
): Promise<{ demand?: DemandSchema; error?: string }> {
  try {
    // In a real app, you'd save `data` to a database here.
    // For this mock app, we just return the data to be added to the client-side state.
    return { demand: data };
  } catch (error) {
    console.error("Error logging demand:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while logging the demand." };
  }
}
