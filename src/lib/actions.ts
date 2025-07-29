
"use server";

import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from "@/ai/flows/generate-property-description";
import { improvePropertyDemandDescription, type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";
import { getPropertyMatchScore, type GetPropertyMatchScoreOutput } from "@/ai/flows/get-property-match-score";
import { getWarehouses, type GetWarehousesInput, type GetWarehousesOutput } from "@/ai/flows/get-warehouses";
import { type PropertySchema, type DemandSchema, type WarehouseSchema } from "./schema";

export async function generateDescriptionAction(
  data: PropertySchema
): Promise<{ description?: string; error?: string }> {
  try {
    // Map form data to AI flow input
    const input: GeneratePropertyDescriptionInput = {
        propertyId: data.propertyId,
        propertyGeoLocation: data.propertyGeoLocation,
        size: data.size,
        floor: data.floor,
        readinessToOccupy: data.readinessToOccupy,
        siteType: data.siteType,
        safety: data.safety,
        ceilingHeight: data.ceilingHeight,
        rentPerSft: data.rentPerSft,
        rentalSecurityDeposit: data.rentalSecurityDeposit,
        userType: data.userType,
        userName: data.userName,
        userCompanyName: data.userCompanyName,
        userPhoneNumber: data.userPhoneNumber,
        userEmail: data.userEmail,
        approvalStatus: data.approvalStatus,
        approvalAuthority: data.approvalAuthority,
        installedCapacity: data.installedCapacity,
        availablePower: data.availablePower,
        genSetBackup: data.genSetBackup,
        fireHydrant: data.fireHydrant,
        fireNoc: data.fireNoc,
        docks: data.docks,
        canopy: data.canopy,
        additionalInformation: data.additionalInformation || "",
    };

    const result = await generatePropertyDescription(input);
    
    return { description: result.propertyDescription };
  } catch (error) {
    console.error("Error generating property description:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while generating the description." };
  }
}

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

export async function getPropertyMatchScoreAction(
  propertyData: PropertySchema,
  allDemands: DemandSchema[],
): Promise<{ submission?: { property: PropertySchema, matchResult: GetPropertyMatchScoreOutput, demandId: string, demandUserEmail?: string }; error?: string }> {
  try {
    if (!propertyData.o2oDealDemandId) {
      return { error: "No Demand ID was provided for matching." };
    }
    
    const demandData = allDemands.find(d => d.demandId === propertyData.o2oDealDemandId);

    if (!demandData) {
        return { error: `Demand with ID "${propertyData.o2oDealDemandId}" not found.` };
    }

    const result = await getPropertyMatchScore({
      property: propertyData,
      demand: demandData,
    });
    
    const submission = {
      property: propertyData,
      matchResult: result,
      demandId: propertyData.o2oDealDemandId,
      demandUserEmail: demandData.userEmail,
    };

    return { submission };
  } catch (error) {
    console.error("Error getting property match score:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while calculating the match score." };
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
