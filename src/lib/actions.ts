
"use server";

import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from "@/ai/flows/generate-property-description";
import { improvePropertyDemandDescription, type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";
import { getPropertyMatchScore, type GetPropertyMatchScoreOutput, type GetPropertyMatchScoreInput } from "@/ai/flows/get-property-match-score";
import { getWarehouses, type GetWarehousesInput, type GetWarehousesOutput } from "@/ai/flows/get-warehouses";
import { findSimilarWarehouses, type FindSimilarWarehousesInput, type FindSimilarWarehousesOutput } from "@/ai/flows/find-similar-warehouses";
import { type PropertySchema, type DemandSchema, type WarehouseSchema } from "./schema";

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

export async function getWarehousesAction(
  input: GetWarehousesInput
): Promise<{ warehouses?: WarehouseSchema[]; error?: string }> {
  try {
    const result: GetWarehousesOutput = await getWarehouses(input);
    return { warehouses: result.warehouses };
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while fetching warehouses." };
  }
}

export async function findSimilarWarehousesAction(
  input: FindSimilarWarehousesInput
): Promise<FindSimilarWarehousesOutput> {
    return findSimilarWarehouses(input);
}
