"use server";

import { generatePropertyDescription, type GeneratePropertyDescriptionInput } from "@/ai/flows/generate-property-description";
import { type PropertySchema } from "./schema";

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
    return { error: "An unexpected error occurred while generating the description." };
  }
}
