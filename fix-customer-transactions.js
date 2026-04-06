const fs = require('fs');
let content = fs.readFileSync('src/components/customer-transactions.tsx', 'utf8');

// Add EngagePathSelector import
content = content.replace(
  `import type { ListingSchema } from '@/lib/schema';`,
  `import type { ListingSchema } from '@/lib/schema';
import { EngagePathSelector } from './engage-path-selector';`
);

// Add expanded state
content = content.replace(
  `export function CustomerTransactions() {
  const { user, users } = useAuth();
  const { registeredLeads } = useData();`,
  `export function CustomerTransactions() {
  const { user, users } = useAuth();
  const { registeredLeads } = useData();
  const [expandedLead, setExpandedLead] = React.useState<string | null>(null);`
);

// Add expand button and EngagePathSelector after the table
content = content.replace(
  `                    <TableRow key={lead.id}>
                        <TableCell className="font-mono text-primary">{lead.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                        <TableCell>`,
  `                    <React.Fragment key={lead.id}>
                    <TableRow className="cursor-pointer hover:bg-secondary/30" onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                        <TableCell className="font-mono text-primary">{lead.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                        <TableCell>`
);

// Find closing of TableRow and add expanded section + Fragment close
content = content.replace(
  `                    </TableRow>
                    );
                })}`,
  `                    </TableRow>
                    {expandedLead === lead.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-secondary/20 p-5">
                          <EngagePathSelector leadId={lead.id} currentPath={lead.engagePath} />
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    );
                })}`
);

fs.writeFileSync('src/components/customer-transactions.tsx', content);
console.log('Done!');
