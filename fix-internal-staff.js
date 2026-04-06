const fs = require('fs');

// 1. Update auth-context.tsx — add staff fields to User type
let auth = fs.readFileSync('src/contexts/auth-context.tsx', 'utf8');
auth = auth.replace(
  `export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer' | 'Agent';
  plan?: 'Free' | 'Paid_Premium';
  isCompanyAdmin?: boolean;
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
};`,
  `export type User = {
  email: string;
  role: 'SuperAdmin' | 'User' | 'O2O' | 'Warehouse Developer' | 'Agent';
  plan?: 'Free' | 'Paid_Premium';
  isCompanyAdmin?: boolean;
  isInternalStaff?: boolean;
  staffRole?: string;
  privileges?: string[];
  companyName: string;
  userName: string;
  phone: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
};`
);
fs.writeFileSync('src/contexts/auth-context.tsx', auth);
console.log('✓ User type updated');

// 2. Update schema.ts — add draft/pending_consent status + new fields
let schema = fs.readFileSync('src/lib/schema.ts', 'utf8');
schema = schema.replace(
  `status: z.enum(['pending', 'approved', 'rejected', 'leased']),`,
  `status: z.enum(['pending', 'approved', 'rejected', 'leased', 'draft', 'pending_consent']),`
);
schema = schema.replace(
  `  createdAt: z.string().datetime().optional(),`,
  `  createdAt: z.string().datetime().optional(),
  createdBy: z.string().optional(),
  consentStatus: z.enum(['pending_consent', 'consented']).optional(),
  consentTimestamp: z.number().optional(),`
);
fs.writeFileSync('src/lib/schema.ts', schema);
console.log('✓ Schema updated');
