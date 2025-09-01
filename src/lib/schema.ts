
import { z } from 'zod';

export const documentSchema = z.object({
  type: z.enum(["layout", "image", "video"]),
  name: z.string(),
  url: z.string().url(),
});

export const listingSchema = z.object({
  // System Metadata
  listingId: z.string(),
  developerId: z.string(), // references userId
  status: z.enum(['pending', 'approved', 'rejected']),
  
  // General Information
  warehouseBoxId: z.string(),
  name: z.string().min(1, "Warehouse name is required."),
  location: z.string().min(1, "Location is required."),
  latLng: z.string().optional(),
  sizeSqFt: z.coerce.number().positive("Size must be a positive number."),
  description: z.string().optional(),
  
  // Commercial Terms
  rentPerSqFt: z.coerce.number().positive("Rent must be a positive number.").optional(),
  rentalSecurityDeposit: z.coerce.number().positive("Deposit must be positive.").optional(),
  
  // Availability & Progress
  availabilityDate: z.string().min(1, "Availability date is required."),
  constructionProgress: z.string().optional(),
  serviceModel: z.enum(['Standard', '3PL', 'Both']).optional(),

  // Area
  area: z.object({
    plinthArea: z.coerce.number().optional(),
    mezzanineArea1: z.coerce.number().optional(),
    mezzanineArea2: z.coerce.number().optional(),
    canopyArea: z.coerce.number().optional(),
    driversRestRoomArea: z.coerce.number().optional(),
    totalChargeableArea: z.coerce.number().positive("Total area is required."),
  }),

  // Building Specifications
  buildingSpecifications: z.object({
    buildingType: z.string().optional(),
    shopFloorLevelDimension: z.string().optional(),
    mezzanineFloorLevelHeightAndDimension: z.string().optional(),
    numberOfDocksAndShutters: z.coerce.number().optional(),
    canopyDimension: z.string().optional(),
    naturalLightingAndVentilation: z.string().optional(),
    roofInsulationStatus: z.string().optional(),
    internalLighting: z.string().optional(),
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


// The old schemas are kept for now to prevent breaking existing components
// They will be removed in subsequent steps.

export const propertySchemaBase = z.object({
  propertyId: z.string(),
  isLocationConfirmed: z.boolean().refine(val => val === true, {
    message: "You must confirm the location match."
  }),
  
  // Property details mirroring demand questions
  size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive('Size must be a positive number.'),
  readinessToOccupy: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
  buildingType: z.enum(['PEB', 'RCC']).optional(),
  floor: z.string().optional(),
  ceilingHeight: z.coerce.number({invalid_type_error: "Ceiling height must be a number."}).positive('Ceiling height must be positive.').optional(),
  ceilingHeightUnit: z.enum(['ft', 'm']).default('ft'),
  docks: z.coerce.number({invalid_type_error: "Docks must be a number."}).int().nonnegative('Docks cannot be negative.').optional(),
  availablePower: z.coerce.number({invalid_type_error: "Power must be a number."}).positive('Power must be positive.').optional(),
  approvalStatus: z.enum(['Obtained', 'Applied For', 'To Apply', 'Un-Approved']),
  fireNoc: z.enum(['Obtained', 'Applied For', 'To Apply']),
  fireHydrant: z.enum(['Installed', 'Can be provided']),

  // Commercials
  rentPerSft: z.coerce.number({invalid_type_error: "Rent must be a number."}).positive('Rent must be positive.'),
  rentalSecurityDeposit: z.coerce.number({invalid_type_error: "Deposit must be a number."}).positive('Deposit must be positive.'),

  // Provider's own details
  userType: z.enum(['Developer', 'Owner']),
  userName: z.string().min(1, 'User name is required.'),
  userCompanyName: z.string().min(1, 'Company name is required.'),
  o2oDealDemandId: z.string().optional(),
  userPhoneNumber: z.string().min(1, 'Phone number is required.'),
  userEmail: z.string().email('Invalid email address.'),
  
  serviceModel: z.enum(['Standard', '3PL', 'Both']).optional(),
  safety: z.enum(['Fully Compounded', 'Partially Compounded', '3-Side Compounded', 'Not Compounded']),
  approvalAuthority: z.enum(['DTCP', 'CMDA', 'BDA']),
  genSetBackup: z.enum(['Available', 'Can be provided']),
  canopy: z.enum(['Installed', 'Can be provided']),
  additionalInformation: z.string().optional(),

  optionals: z.object({
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
      mpcbEcCategory: z.enum(['Acceptable', 'May Be', 'No']).optional(),
      etpDetails: z.enum(['Acceptable', 'May Be', 'No']).optional(),
      effluentCharacteristics: z.enum(['Acceptable', 'May Be', 'No']).optional(),
  }).optional(),
});


export const createPropertySchema = (demand: DemandSchema | undefined) => {
    if (!demand) return propertySchemaBase; // Return base schema if no demand context

    let schema = propertySchemaBase;

    // Dynamically add requirement checks based on demand
    if (demand.buildingType) {
        schema = schema.refine(data => !!data.buildingType, {
            message: "Building type is required for this demand.",
            path: ["buildingType"],
        });
    }
    if (demand.floorPreference) {
        schema = schema.refine(data => !!data.floor, {
            message: "Floor preference is required for this demand.",
            path: ["floor"],
        });
    }
    if (demand.ceilingHeight) {
        schema = schema.refine(data => data.ceilingHeight !== undefined, {
            message: "Ceiling height is required for this demand.",
            path: ["ceilingHeight"],
        });
    }
    if (demand.docks !== undefined) {
        schema = schema.refine(data => data.docks !== undefined, {
            message: "Number of docks is required for this demand.",
            path: ["docks"],
        });
    }
    if (demand.powerMin || demand.powerMax) {
        schema = schema.refine(data => data.availablePower !== undefined, {
            message: "Available power is required for this demand.",
            path: ["availablePower"],
        });
    }
    if (demand.optionals?.crane?.required) {
        schema = schema.refine(data => !!data.optionals?.crane?.required, {
            message: "Crane information is required for this demand.",
            path: ["optionals.crane.required"],
        });
    }
    if (demand.operations?.mpcbEcCategory) {
        schema = schema.refine(data => !!data.operations?.mpcbEcCategory, {
            message: "MPCB/EC category compliance is required.",
            path: ["operations.mpcbEcCategory"],
        });
    }

    return schema;
};

export type PropertySchema = z.infer<typeof propertySchemaBase>;


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

const warehouseFormSchema = z.object({
    id: z.string(),
    locationName: z.string().min(1, 'Location name is required.'),
    latLng: z.string().min(1, 'Lat/Lng is required.')
      .regex(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}, ?-?([1]?[0-7]?[0-9]|[1-9]?[0-9])\.{1}\d{1,6}$/, 'Invalid Lat/Lng format. Use "lat, lng".'),
    isActive: z.boolean(),
    is3pl: z.boolean().optional().default(false),
    size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive(),
    readiness: z.enum(['Ready for Occupancy', 'Under Construction', 'Available in 3 months']),
    specifications: z.object({
        ceilingHeight: z.coerce.number({invalid_type_error: "Ceiling height must be a number."}).positive(),
        docks: z.coerce.number({invalid_type_error: "Docks must be a number."}).int().nonnegative(),
        officeSpace: z.boolean(),
        flooringType: z.string().min(1, 'Flooring type is required.'),
    }),
    imageUrls: z.array(z.string().url().or(z.literal(''))).optional(),
});

export const warehouseSchema = warehouseFormSchema.transform(data => {
    const [lat, lng] = data.latLng.split(',').map(s => parseFloat(s.trim()));
    return {
        ...data,
        imageUrls: data.imageUrls?.filter(url => url), // Filter out empty strings
        generalizedLocation: { lat, lng },
    };
});


export type WarehouseSchema = z.infer<typeof warehouseSchema>;
