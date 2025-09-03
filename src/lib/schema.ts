
import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);

function asOptionalField<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(emptyStringToUndefined);
}

export const documentSchema = z.object({
  type: z.enum(["layout", "image", "video"]),
  name: z.string(),
  url: z.string().url(),
});

export const listingSchema = z.object({
  // System Metadata
  listingId: z.string(),
  developerId: z.string(), // references userId
  status: z.enum(['pending', 'approved', 'rejected', 'leased']),
  
  // General Information
  warehouseBoxId: z.string(),
  name: z.string().min(1, "Warehouse name is required."),
  location: z.string().min(1, "Location is required."),
  latLng: z.string().optional(),
  sizeSqFt: z.coerce.number().positive("Size must be a positive number."),
  description: z.string().optional(),
  
  // Commercial Terms
  rentPerSqFt: asOptionalField(z.coerce.number().positive("Rent must be a positive number.")),
  rentalSecurityDeposit: asOptionalField(z.coerce.number().positive("Deposit must be positive.")),
  
  // Availability & Progress
  availabilityDate: z.string().min(1, "Availability date is required."),
  constructionProgress: z.string().optional(),
  serviceModel: z.enum(['Standard', '3PL', 'Both']).optional(),

  // Area
  area: z.object({
    plinthArea: asOptionalField(z.coerce.number()),
    mezzanineArea1: asOptionalField(z.coerce.number()),
    mezzanineArea2: asOptionalField(z.coerce.number()),
    canopyArea: asOptionalField(z.coerce.number()),
    driversRestRoomArea: asOptionalField(z.coerce.number()),
    totalChargeableArea: asOptionalField(z.coerce.number().positive("Total area is required.")),
  }),

  // Building Specifications
  buildingSpecifications: z.object({
    buildingType: z.string().optional(),
    shopFloorLevelDimension: z.string().optional(),
    mezzanineFloorLevelHeightAndDimension: z.string().optional(),
    numberOfDocksAndShutters: asOptionalField(z.coerce.number()),
    canopyDimension: z.string().optional(),
    naturalLightingAndVentilation: z.string().optional(),
    internalLighting: z.string().optional(),
    craneSupportStructureAvailable: z.boolean().optional(),
    craneAvailable: z.boolean().optional(),
    warehouseLayoutAvailable: z.boolean().optional(),
    // New Roof Section
    roofType: z.enum(['Galvalume', 'RCC', 'ACC']).optional(),
    eveHeightMeters: asOptionalField(z.coerce.number()),
    roofInsulation: z.enum(['Insulated', 'Non-Insulated']).optional(),
    ventilation: z.enum(['Turbo', 'Ridge']).optional(),
    louvers: z.boolean().optional(),
    // Old Roof field - to be deprecated but kept for compatibility for now
    roofInsulationStatus: z.string().optional(),
  }),

  // Site Specifications
  siteSpecifications: z.object({
    typeOfFlooringInside: z.string().optional(),
    typeOfFlooringOutside: z.string().optional(),
    typeOfRoad: z.string().optional(),
  }),
  
  // Certificates & Approvals
  certificatesAndApprovals: z.object({
    parkApproval: z.boolean().default(false),
    buildingApproval: z.boolean().default(false),
    fireLicense: z.boolean().default(false),
    fireNOC: z.boolean().default(false),
    buildingInsurance: z.boolean().default(false),
    pcbForAir: z.boolean().default(false),
    pcbForWater: z.boolean().default(false),
    propertyTax: z.boolean().default(false),
  }),
  
  // Documents & Media
  documents: z.array(documentSchema).optional(),

  // Internal Developer/Project Details
  developerName: z.string().optional(),
  developerContactName: z.string().optional(),
  developerMobile: z.string().optional(),
  developerEmail: z.string().email().optional(),
  developerWebsite: z.string().url().optional(),
  projectName: z.string().optional(),
  siteDetails: z.string().optional(),
});

export type ListingSchema = z.infer<typeof listingSchema>;

const optionalCraneSchema = z.object({
    required: z.boolean().default(false),
    type: z.enum(['EOT', 'Gantry']).optional(),
    count: z.coerce.number().optional(),
    transverseLength: z.coerce.number().optional(),
    span: z.coerce.number().optional(),
    underhookHeight: z.coerce.number().optional(),
    capacity: z.coerce.number().optional(),
}).optional();

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

export const demandSchema = z.object({
  demandId: z.string(),
  companyName: z.string().min(1, 'Company name is required.'),
  userName: z.string().min(1, 'User name is required.'),
  userEmail: z.string().email('Invalid email address.'),
  userPhone: z.string().min(1, 'Phone number is required.'),
  operationType: z.enum(['Manufacturing', 'Warehousing'], {
    required_error: "Type of operation is required.",
  }).default('Warehousing'),
  location: z.string().min(1, 'Location is required.'),
  locationName: z.string().optional(),
  radius: z.coerce.number({invalid_type_error: "Radius must be a number."}).positive("Radius must be a positive number."),
  size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive('Size must be positive.'),
  sizeMin: z.coerce.number().optional(),
  sizeMax: z.coerce.number().optional(),
  sizeVariationPercentage: z.number().min(0).max(100).optional(),
  ceilingHeight: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Ceiling height must be a number." })
      .positive("Ceiling height must be positive.")
      .optional()
  ),
  ceilingHeightUnit: z.enum(['ft', 'm']).default('ft'),
  docks: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Docks must be a number." })
      .int()
      .nonnegative("Docks cannot be negative.")
      .optional()
  ),
  powerMin: z.coerce.number().optional(),
  powerMax: z.coerce.number().optional(),
  readiness: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
  description: z.string().optional(),
  buildingType: z.enum(['PEB', 'RCC']).default('PEB'),
  floorPreference: z.enum(['Ground', 'Multi-Floor', 'Any']).optional(),
  preferences: z.object({
    nonCompromisable: z.array(z.string()).optional(),
    approvals: z.enum(['Must to have', 'Good to have']).default('Must to have'),
    fireNoc: z.enum(['Must to have', 'Good to have']).default('Must to have'),
    fireSafety: z.enum(['Must to have', 'Good to have']).default('Must to have'),
  }),
  optionals: z.object({
    officeSpaceMin: z.coerce.number().optional(),
    officeSpaceMax: z.coerce.number().optional(),
    cafeteriaOrCanteen: z.enum(['Cafeteria', 'Canteen']).default('Cafeteria'),
    seatingCapacity: z.coerce.number().optional(),
    additionalToiletsMen: z.coerce.number().optional(),
    additionalToiletsWomen: z.coerce.number().optional(),
    truckParkingYardMin: z.coerce.number().optional(),
    truckParkingYardMax: z.coerce.number().optional(),
    openStorageYardMin: z.coerce.number().optional(),
    openStorageYardMax: z.coerce.number().optional(),
    tenantSpecificImprovements: z.string().optional(),
    processWaterRequirement: z.coerce.number().optional(),
    hvacArea: z.string().optional(),
    sprinklerRequirement: z.string().optional(),
    crane: z.object({
        required: z.boolean().default(false),
        type: z.enum(['EOT', 'Gantry']).optional(),
        count: z.coerce.number().optional(),
        transverseLength: z.coerce.number().optional(),
        span: z.coerce.number().optional(),
        underhookHeight: z.coerce.number().optional(),
        capacity: z.coerce.number().optional(),
    }).optional(),
    lightingRequirement: z.string().optional(),
  }).optional(),
  operations: z.object({
      mpcbEcCategory: z.enum(['Green', 'Orange', 'Red']).optional(),
      etpDetails: z.string().optional(),
      effluentCharacteristics: z.string().optional(),
  }).optional(),
}).refine(data => {
    if (data.preferences?.nonCompromisable?.includes('ceilingHeight')) {
        return data.ceilingHeight !== undefined && data.ceilingHeight > 0;
    }
    return true;
}, {
    message: "A value is required when 'Ceiling Height' is a priority.",
    path: ['ceilingHeight'],
}).refine(data => {
    if (data.preferences?.nonCompromisable?.includes('docks')) {
        return data.docks !== undefined && data.docks >= 0;
    }
    return true;
}, {
    message: "A value is required when 'Number of Docks' is a priority.",
    path: ['docks'],
});

export type DemandSchema = z.infer<typeof demandSchema>;

// Function to dynamically create the property schema based on demand
export const createPropertySchema = (demand?: DemandSchema) => {
    let schema = z.object({
        propertyId: z.string(),
        isLocationConfirmed: z.boolean().refine(val => val === true, { message: "You must confirm the location match." }),
        size: z.coerce.number().positive(),
        floor: z.enum(['Ground', 'First Floor', 'Multi-Floor']),
        readinessToOccupy: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
        serviceModel: z.enum(['Standard', '3PL', 'Both']),
        buildingType: z.enum(['PEB', 'RCC']).optional(),
        safety: z.string().min(1),
        ceilingHeight: z.coerce.number().optional(),
        ceilingHeightUnit: z.enum(['ft', 'm']),
        docks: z.coerce.number().optional(),
        rentPerSft: z.coerce.number().positive(),
        rentalSecurityDeposit: z.coerce.number().positive(),
        userType: z.enum(['Developer', 'Owner']),
        userName: z.string(),
        userCompanyName: z.string(),
        userPhoneNumber: z.string(),
        userEmail: z.string().email(),
        o2oDealDemandId: z.string().optional(),
        approvalStatus: z.enum(['Obtained', 'Applied For', 'To Apply', 'Un-Approved']),
        approvalAuthority: z.enum(['DTCP', 'CMDA', 'BDA']).optional(),
        availablePower: z.coerce.number().optional(),
        genSetBackup: z.enum(['Available', 'Can be provided']),
        fireHydrant: z.enum(['Installed', 'Can be provided']),
        fireNoc: z.enum(['Obtained', 'Applied For', 'To Apply']),
        canopy: z.enum(['Installed', 'Can be provided']),
        additionalInformation: z.string().optional(),
        optionals: z.object({
          crane: optionalCraneSchema,
          officeSpaceMin: z.coerce.number().optional(),
          officeSpaceMax: z.coerce.number().optional(),
          cafeteriaOrCanteen: z.enum(['Cafeteria', 'Canteen']).optional(),
          seatingCapacity: z.coerce.number().optional(),
          additionalToiletsMen: z.coerce.number().optional(),
          additionalToiletsWomen: z.coerce.number().optional(),
          truckParkingYardMin: z.coerce.number().optional(),
          truckParkingYardMax: z.coerce.number().optional(),
          openStorageYardMin: z.coerce.number().optional(),
          openStorageYardMax: z.coerce.number().optional(),
          tenantSpecificImprovements: z.string().optional(),
          processWaterRequirement: z.coerce.number().optional(),
          hvacArea: z.string().optional(),
          sprinklerRequirement: z.string().optional(),
          lightingRequirement: z.string().optional(),
        }).optional(),
        operations: z.object({
          mpcbEcCategory: z.enum(['Acceptable', 'May Be', 'No']).optional(),
          etpDetails: z.enum(['Acceptable', 'May Be', 'No']).optional(),
          effluentCharacteristics: z.enum(['Acceptable', 'May Be', 'No']).optional(),
        }).optional(),
    });

    if (demand?.preferences?.nonCompromisable?.includes('crane')) {
        schema = schema.extend({
            optionals: schema.shape.optionals.extend({
                crane: optionalCraneSchema.refine(data => data?.required === true, {
                    message: "Crane is a priority and must be provided.",
                    path: ['required']
                })
            })
        });
    }

    if (demand?.operationType === 'Manufacturing') {
         schema = schema.extend({
            operations: schema.shape.operations.refine(data => {
                if (demand.operations?.mpcbEcCategory) return data?.mpcbEcCategory !== undefined;
                return true;
            }, { message: "MPCB/EC category compliance must be specified.", path: ['mpcbEcCategory']})
            .refine(data => {
                if (demand.operations?.etpDetails) return data?.etpDetails !== undefined;
                return true;
            }, { message: "ETP details compliance must be specified.", path: ['etpDetails']})
             .refine(data => {
                if (demand.operations?.effluentCharacteristics) return data?.effluentCharacteristics !== undefined;
                return true;
            }, { message: "Effluent characteristics compliance must be specified.", path: ['effluentCharacteristics']})
        });
    }

    return schema;
};

export type PropertySchema = z.infer<ReturnType<typeof createPropertySchema>>;

const negotiableTermSchema = z.object({
    customerValue: z.string().optional(),
    providerValue: z.string().optional(),
    agreedValue: z.string().optional(),
}).optional();

const customTermSchema = z.object({
    label: z.string(),
    customerValue: z.string().optional(),
    providerValue: z.string().optional(),
    agreedValue: z.string().optional(),
})

export const commercialTermsSchema = z.object({
    siteInfo: z.object({
        postalAddress: negotiableTermSchema,
        buildingNumber: negotiableTermSchema,
        googleCoordinates: negotiableTermSchema,
        buildingStatus: negotiableTermSchema,
    }).optional(),
    area: z.object({
        plinthArea: negotiableTermSchema,
        mezzanineArea1: negotiableTermSchema,
        mezzanineArea2: negotiableTermSchema,
        canopyArea: negotiableTermSchema,
        driversRestRoom: negotiableTermSchema,
        totalChargeableArea: negotiableTermSchema,
    }).optional(),
    tenantImprovements: z.object({
        electricityPower: negotiableTermSchema,
        internalCabling: negotiableTermSchema,
        hvac: negotiableTermSchema,
        mechanisedAccess: negotiableTermSchema,
        washroomsOnMezzanine: negotiableTermSchema,
        ramp: negotiableTermSchema,
    }).optional(),
    leaseTerms: z.object({
        leaseTenure: negotiableTermSchema,
        leaseLockIn: negotiableTermSchema,
        fitoutHandoverDate: negotiableTermSchema,
        fullHandoverDate: negotiableTermSchema,
        rentFreePeriod: negotiableTermSchema,
        chargeableArea: negotiableTermSchema,
        leaseCommencementDate: negotiableTermSchema,
        rentCommencementDate: negotiableTermSchema,
        scopeAndCostOfRegistration: negotiableTermSchema,
        customItems: z.array(customTermSchema).optional(),
    }),
    commercialTerms: z.object({
        chargeableArea: negotiableTermSchema,
        buildingRentPerSft: negotiableTermSchema,
        totalRentPerMonth: negotiableTermSchema,
        capexItems: z.array(customTermSchema).optional(),
        netTotalRental: negotiableTermSchema,
        camCharges: negotiableTermSchema,
        ifrsd: negotiableTermSchema,
        rentEscalation: negotiableTermSchema,
        commitmentPhase2: negotiableTermSchema,
        additionalCharges: negotiableTermSchema,
    }),
    building: z.object({
        buildingType: negotiableTermSchema,
        docksAndShutters: negotiableTermSchema,
    }).optional(),
});
export type CommercialTermsSchema = z.infer<typeof commercialTermsSchema>;

// Schemas for Predictive Analytics Flow
export const PredictDemandTrendsInputSchema = z.object({
  timeHorizon: z.enum(['next quarter', 'next 6 months']).default('next quarter')
    .describe('The time period for which to predict demand trends.'),
  location: z.string().optional().describe('An optional location (e.g., city or industrial park) to focus the analysis on.'),
  buildingType: z.string().optional().describe('An optional building type to filter the analysis.'),
  serviceModel: z.string().optional().describe('An optional service model to filter the analysis.'),
  availability: z.string().optional().describe('Filter by property availability status.'),
  craneAvailable: z.boolean().optional().describe('Filter by whether a crane is available.'),
  roofType: z.string().optional().describe('Filter by the type of roof.'),
  fireNOC: z.boolean().optional().describe('Filter by whether Fire NOC is obtained.'),
  eveHeightMin: z.number().optional().describe('Filter by minimum eve height in meters.'),
  docksMin: z.number().optional().describe('Filter by minimum number of docks.'),
  roofInsulation: z.string().optional().describe('Filter by roof insulation status.'),
  ventilation: z.string().optional().describe('Filter by ventilation type.'),
  sizeMin: z.number().optional().describe('Filter by minimum property size in sq. ft.'),
  sizeMax: z.number().optional().describe('Filter by maximum property size in sq. ft.'),
});
export type PredictDemandTrendsInput = z.infer<typeof PredictDemandTrendsInputSchema>;

const PredictedHotspotSchema = z.object({
  location: z.string().describe('The predicted high-demand location (e.g., "Oragadam, Chennai").'),
  reasoning: z.string().describe('The justification for why this location is predicted to be a hotspot.'),
  growthPercentage: z.number().optional().describe('The estimated percentage growth in demand for this location.'),
});

const TrendingSpecSchema = z.object({
  specification: z.string().describe('The specification that is trending (e.g., "Ceiling Height > 45ft", "Size > 200,000 sq.ft.", "3PL Service Model").'),
  reasoning: z.string().describe('The reason behind this trend.'),
});

export const PredictDemandTrendsOutputSchema = z.object({
  marketOutlook: z.string().describe('A summary of the predicted market outlook for the upcoming period, including key trends and shifts.'),
  predictedHotspots: z.array(PredictedHotspotSchema).describe('A list of geographic locations where demand is expected to increase.'),
  trendingSpecifications: z.array(TrendingSpecSchema).describe('A list of warehouse specifications that are predicted to be in high demand.'),
});
export type PredictDemandTrendsOutput = z.infer<typeof PredictDemandTrendsOutputSchema>;

export const layoutRequestSchema = z.object({
  listingId: z.string(),
  listingName: z.string(),
  userName: z.string().min(1, 'Your name is required.'),
  department: z.string().min(1, 'Department is required.'),
  title: z.string().min(1, 'Your title is required.'),
  mobile: z.string().min(10, 'A valid mobile number is required.'),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms.' }),
  }),
});
export type LayoutRequestData = z.infer<typeof layoutRequestSchema>;
