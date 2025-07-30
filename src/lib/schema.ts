
import { z } from 'zod';

export const propertySchema = z.object({
  propertyId: z.string(),
  propertyGeoLocation: z.string().optional(),
  isLocationConfirmed: z.boolean().refine(val => val === true, {
    message: "You must confirm the location match."
  }),
  size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive('Size must be a positive number.'),
  floor: z.string().min(1, 'Floor is required.'),
  readinessToOccupy: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
  siteType: z.enum(['Standalone', 'Part of Industrial Park', 'Part of Commercial Project']),
  safety: z.string().min(1, 'Safety information is required.'),
  ceilingHeight: z.coerce.number({invalid_type_error: "Ceiling height must be a number."}).positive('Ceiling height must be positive.'),
  
  rentPerSft: z.coerce.number({invalid_type_error: "Rent must be a number."}).positive('Rent must be positive.'),
  rentalSecurityDeposit: z.coerce.number({invalid_type_error: "Deposit must be a number."}).positive('Deposit must be positive.'),

  userType: z.enum(['Developer', 'Owner']),
  userName: z.string().min(1, 'User name is required.'),
  userCompanyName: z.string().min(1, 'Company name is required.'),
  o2oDealDemandId: z.string().optional(),
  userPhoneNumber: z.string().min(1, 'Phone number is required.'),
  userEmail: z.string().email('Invalid email address.'),

  approvalStatus: z.enum(['Obtained', 'Applied For', 'To Apply', 'Un-Approved']),
  approvalAuthority: z.enum(['DTCP', 'CMDA', 'BDA']),

  installedCapacity: z.string().min(1, 'Installed capacity is required.'),
  availablePower: z.string().min(1, 'Available power is required.'),
  genSetBackup: z.enum(['Available', 'Can be provided']),
  
  fireHydrant: z.enum(['Installed', 'Can be provided']),
  fireNoc: z.enum(['Obtained', 'Applied For', 'To Apply']),
  
  docks: z.coerce.number({invalid_type_error: "Docks must be a number."}).int().nonnegative('Docks cannot be negative.'),
  canopy: z.enum(['Installed', 'Can be provided']),

  additionalInformation: z.string().optional(),
});

export type PropertySchema = z.infer<typeof propertySchema>;

export const demandSchema = z.object({
  demandId: z.string(),
  companyName: z.string().min(1, 'Company name is required.'),
  userName: z.string().min(1, 'User name is required.'),
  userEmail: z.string().email('Invalid email address.'),
  userPhone: z.string().min(1, 'Phone number is required.'),
  propertyType: z.enum(['Industrial Building', 'Warehouse'], {
    required_error: "Property type is required.",
  }),
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
  ceilingHeightUnit: z.enum(['ft', 'm']).optional(),
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
