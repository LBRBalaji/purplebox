
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight, Building, Check, Clock, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const providerStatusConfig: { [key in RegisteredLeadStatus]: { text: string; icon: React.ElementType, color: string } } = {
  Pending: { text: 'Pending', icon: Clock, color: 'text-amber-600' },
  Acknowledged: { text: 'Acknowledged', icon: Check, color: 'text-green-600' },
  Rejected: { text: 'Rejected', icon: X, color: 'text-red-600' },
};


export function CustomerTransactions() {
  const { user, users } = useAuth();
  const { registeredLeads } = useData();

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
                <TableHead>Involved Providers & Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTransactions.map(lead => {
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-mono text-primary">{lead.id}</TableCell>
                    <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {lead.providers.map(p => {
                          const providerUser = users[p.providerEmail];
                          const statusInfo = providerStatusConfig[p.status];
                          const Icon = statusInfo.icon;
                          return (
                            <div key={p.providerEmail} className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground"/>
                                <span className="text-sm font-medium flex-grow">{providerUser?.companyName || p.providerEmail}</span>
                                <Badge variant="outline" className={cn("text-xs font-normal", statusInfo.color)}>
                                    <Icon className="h-3 w-3 mr-1.5"/>
                                    {statusInfo.text}
                                </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/leads/${lead.id}`}>
                              View Activity <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
