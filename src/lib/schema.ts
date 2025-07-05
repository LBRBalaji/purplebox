import { z } from 'zod';

export const propertySchema = z.object({
  propertyId: z.string(),
  propertyGeoLocation: z.string().min(1, 'Geo location is required.'),
  size: z.string().min(1, 'Size is required.'),
  floor: z.string().min(1, 'Floor is required.'),
  readinessToOccupy: z.enum(['Immediate', 'Within 3 months', 'Within 6 months', 'BTS']),
  siteType: z.enum(['Standalone', 'Part of Industrial Park', 'Part of Commercial Project']),
  safety: z.string().min(1, 'Safety information is required.'),
  ceilingHeight: z.string().min(1, 'Ceiling height is required.'),
  
  rentPerSft: z.string().min(1, 'Rent is required.'),
  rentalSecurityDeposit: z.string().min(1, 'Deposit is required.'),

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
  
  docks: z.string().min(1, 'Number of docks is required.'),
  canopy: z.enum(['Installed', 'Can be provided']),

  additionalInformation: z.string().optional(),
});

export type PropertySchema = z.infer<typeof propertySchema>;
