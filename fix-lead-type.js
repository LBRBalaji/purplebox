const fs = require('fs');
let content = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');

content = content.replace(
  `export type RegisteredLead = {
  id: string; // Unique transaction ID
  customerId: string; // The User's email (ID)
  agentId?: string; // Optional agent email
  leadName: string;
  leadContact: string;
  leadEmail: string;
  leadPhone: string;
  requirementsSummary: string;
  registeredBy: string; // email of LBO2O user
  registeredAt: string;
  providers: RegisteredLeadProvider[];
  isO2OCollaborator?: boolean;
}`,
  `export type RegisteredLead = {
  id: string;
  customerId: string;
  agentId?: string;
  leadName: string;
  leadContact: string;
  leadEmail: string;
  leadPhone: string;
  requirementsSummary: string;
  registeredBy: string;
  registeredAt: string;
  providers: RegisteredLeadProvider[];
  isO2OCollaborator?: boolean;
  engagePath?: 'direct' | 'orsone' | 'agent' | null;
  agentInviteCode?: string;
  agentInviteEmail?: string;
  agentInviteExpiry?: number;
  messageGated?: boolean;
}`
);

fs.writeFileSync('src/contexts/data-context.tsx', content);
console.log('Done!');
