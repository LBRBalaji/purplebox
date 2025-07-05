"use server";

import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from "@/ai/flows/generate-property-description";
import { improvePropertyDemandDescription, type ImprovePropertyDemandDescriptionInput } from "@/ai/flows/improve-property-demand";
import { getPropertyMatchScore, type GetPropertyMatchScoreOutput } from "@/ai/flows/get-property-match-score";
import { type PropertySchema, type DemandSchema } from "./schema";
import { mockDemands } from "./mock-data";


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

export async function logAndImproveDemandAction(
  data: DemandSchema
): Promise<{ improvedDescription?: string; error?: string }> {
  try {
    console.log("Logging demand:", data);

    const input: ImprovePropertyDemandDescriptionInput = {
      description: data.description,
      propertyType: data.propertyType,
      location: data.location,
      size: data.size,
      additionalDetails: "", // Can be extended later
    };

    const result = await improvePropertyDemandDescription(input);
    
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error("Error improving demand description:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while improving the description." };
  }
}

export async function getPropertyMatchScoreAction(
  propertyData: PropertySchema
): Promise<{ result?: GetPropertyMatchScoreOutput; error?: string }> {
  try {
    if (!propertyData.o2oDealDemandId) {
      return { error: "No Demand ID was provided for matching." };
    }

    // In a real app, you would fetch this from a database.
    // For now, we find it in the mock data.
    const demandData = mockDemands.find(d => d.demandId === propertyData.o2oDealDemandId);

    if (!demandData) {
        return { error: `Demand with ID "${propertyData.o2oDealDemandId}" not found.` };
    }

    const result = await getPropertyMatchScore({
      property: propertyData,
      demand: demandData as DemandSchema, // Cast because mock data isn't strictly typed
    });
    
    // In a real app, you would save this match result to a database.
    console.log("Match score calculated:", result);

    return { result };
  } catch (error) {
    console.error("Error getting property match score:", error);
    const e = error as Error;
    return { error: e.message || "An unexpected error occurred while calculating the match score." };
  }
}
