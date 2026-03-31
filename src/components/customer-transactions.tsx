
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight, Building } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus, Submission } from '@/contexts/data-context';
import Link from 'next/link';
import type { ListingSchema } from '@/lib/schema';
import { EngagePathSelector } from './engage-path-selector';

export function CustomerTransactions() {
  const { user, users } = useAuth();
  const { registeredLeads } = useData();
  const [expandedLead, setExpandedLead] = React.useState<string | null>(null);

  const myTransactions = React.useMemo(() => {
    if (!user) return [];
    return registeredLeads.filter(lead => lead.customerId === user.email);
  }, [registeredLeads, user]);

  if (myTransactions.length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>No Active Transactions</CardTitle>
            <CardDescription className="mt-2">When a formal transaction is initiated for one of your demands, it will appear here.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <div className="mb-8">
            <h2 className="text-3xl font-bold font-headline tracking-tight">My Transactions</h2>
            <p className="text-muted-foreground mt-2">Track the progress and activity for your ongoing lease transactions.</p>
        </div>
        <Card>
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Requirements Summary</TableHead>
                    <TableHead>Developer(s)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {myTransactions.map(lead => {
                    return (
                    <React.Fragment key={lead.id}>
                    <TableRow className="cursor-pointer hover:bg-secondary/30" onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                        <TableCell className="font-mono text-primary">{lead.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                        <TableCell>
                        <div className="flex flex-col gap-2">
                            {lead.providers.map(p => {
                            const providerUser = users[p.providerEmail];
                            return (
                                <div key={p.providerEmail} className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground"/>
                                    <span className="text-sm font-medium flex-grow">{providerUser?.companyName || p.providerEmail}</span>
                                </div>
                            )
                            })}
                        </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/dashboard/leads/${lead.id}`}>
                                        View Activity <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                    {expandedLead === lead.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-secondary/20 p-5">
                          <EngagePathSelector leadId={lead.id} currentPath={lead.engagePath} />
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    );
                })}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
