const fs = require('fs');
let content = fs.readFileSync('src/components/provider-leads.tsx', 'utf8');

// Add import
content = content.replace(
  `import { AcknowledgeLeadDialog } from './acknowledge-lead-dialog';`,
  `import { AcknowledgeLeadDialog } from './acknowledge-lead-dialog';
import { DeveloperEngagePath } from './developer-engage-path';`
);

// Add expandedLead state
content = content.replace(
  `  const [leadToAcknowledge, setLeadToAcknowledge] = React.useState<RegisteredLead | null>(null);`,
  `  const [leadToAcknowledge, setLeadToAcknowledge] = React.useState<RegisteredLead | null>(null);
  const [expandedLeadId, setExpandedLeadId] = React.useState<string | null>(null);`
);

// Add "Choose Path" button for provider leads that are not brokered
content = content.replace(
  `                                            {isAdminOrO2O && lead.isO2OCollaborator && (
                                                <Button size="sm" onClick={() => handleRegisterWithProvider(lead)} disabled={isAlreadyRegisteredWithProvider}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> 
                                                    {isAlreadyRegisteredWithProvider ? 'Provider Assigned' : 'Assign to Provider'}
                                                </Button>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );`,
  `                                            {isAdminOrO2O && lead.isO2OCollaborator && (
                                                <Button size="sm" onClick={() => handleRegisterWithProvider(lead)} disabled={isAlreadyRegisteredWithProvider}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> 
                                                    {isAlreadyRegisteredWithProvider ? 'Provider Assigned' : 'Assign to Provider'}
                                                </Button>
                                            )}
                                            {isProvider && !lead.isO2OCollaborator && (
                                                <Button size="sm" variant={lead.developerEngagePath ? 'outline' : 'default'}
                                                  className={lead.developerEngagePath ? 'border-green-200 text-green-700 bg-green-50' : ''}
                                                  onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}>
                                                  {lead.developerEngagePath ? '✓ Path Chosen' : 'Choose Engage Path'}
                                                </Button>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {isProvider && !lead.isO2OCollaborator && expandedLeadId === lead.id && (
                                      <TableRow>
                                        <TableCell colSpan={5} className="bg-secondary/20 p-5">
                                          <DeveloperEngagePath leadId={lead.id} currentPath={lead.developerEngagePath} />
                                        </TableCell>
                                      </TableRow>
                                    )}
                                );`
);

fs.writeFileSync('src/components/provider-leads.tsx', content);
console.log('Done!');
