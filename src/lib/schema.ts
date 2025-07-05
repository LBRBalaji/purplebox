import { z } from 'zod';

export const propertySchema = z.object({
  propertyId: z.string(),
  propertyGeoLocation: z.string().min(1, 'Geo location is required.'),
  size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive('Size must be a positive number.'),
  floor: z.string().min(1, 'Floor is required.'),
  readinessToOccupy: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
  siteType: z.enum(['Standalone', 'Part of Industrial Park', 'Part of Commercial Project']),
  safety: z.string().min(1, 'Safety information is required.'),
  ceilingHeight: z.coerce.number({invalid_type_error: "Ceiling height must be a number."}).positive('Ceiling height must be positive.'),
  
  rentPerSft: z.coerce.number({invalid_type_error: "Rent must be a number."}).positive('Rent must be positive.'),
  rentalSecurityDeposit: z.coerce.number({invalid_type_error: "Deposit must be a number."}).positive('Deposit must be positive.'),

  userType: z.enum(['Developer', 'Agent', 'Owner']),
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
  propertyType: z.enum(['Industrial Building', 'Warehouse', 'Retail Showroom', 'Office Space'], {
    required_error: "Property type is required.",
  }),
  location: z.string().min(1, 'Location is required.'),
  radius: z.coerce.number({invalid_type_error: "Radius must be a number."}).positive("Radius must be a positive number."),
  size: z.coerce.number({invalid_type_error: "Size must be a number."}).positive('Size must be positive.'),
  ceilingHeight: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Ceiling height must be a number." })
      .positive("Ceiling height must be positive.")
      .optional()
  ),
  docks: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce
      .number({ invalid_type_error: "Docks must be a number." })
      .int()
      .nonnegative("Docks cannot be negative.")
      .optional()
  ),
  readiness: z.enum(['Immediate', 'Within 45 Days', 'Within 90 Days', 'More than 90 Days', 'BTS']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  preferences: z.object({
    nonCompromisable: z.array(z.string()).min(1, { message: "Please select at least one priority requirement." }),
  }),
});

export type DemandSchema = z.infer<typeof demandSchema>;
