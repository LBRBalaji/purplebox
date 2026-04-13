
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

export function CustomerTransactions() {
  const { user, users } = useAuth();
  const { registeredLeads } = useData();
  const [expandedLead, setExpandedLead] = React.useState<string | null>(null);

  const myTransactions = React.useMemo(() => {
    if (!user) return [];
    const all = registeredLeads.filter(lead =>
      lead.customerId === user.email ||
      (lead as any).invitees?.some((inv: any) => inv.email === user.email)
    );
    return all;
  }, [registeredLeads, user]);

  const platformDeals = myTransactions.filter(l => !(l as any).isOffPlatform);
  const offPlatformDeals = myTransactions.filter(l => !!(l as any).isOffPlatform);

  if (myTransactions.length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>No Active Transactions</CardTitle>
            <CardDescription className="mt-2">When a formal transaction is initiated for one of your demands, it will appear here. You can also <a href="/register-deal" className="text-primary underline font-semibold">register an off-platform deal</a>.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">My Transactions</h2>
        <p className="text-muted-foreground mt-2">Track the progress and activity for your ongoing lease transactions.</p>
      </div>

      {/* Off-platform deals */}
      {offPlatformDeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold" style={{color:'#1e1537'}}>Off-Platform Deals</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(29,158,117,0.12)',color:'#0f7c5f',border:'1px solid rgba(29,158,117,0.25)'}}>
              Registered deals
            </span>
          </div>
          <div className="space-y-2">
            {offPlatformDeals.map(lead => {
              const prop = (lead as any).offPlatformProperty;
              const inviteeCount = (lead as any).invitees?.length || 0;
              return (
                <div key={lead.id} className="flex items-center gap-4 p-4 rounded-xl" style={{background:'#fff',border:'1px solid hsl(259 30% 88%)'}}>
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(29,158,117,0.1)'}}>
                    <Building className="h-5 w-5" style={{color:'#0f7c5f'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>{prop ? prop.address : lead.requirementsSummary}</p>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{background:'rgba(29,158,117,0.12)',color:'#0f7c5f'}}>Off-Platform</span>
                    </div>
                    <p className="text-xs" style={{color:'#aaa'}}>{prop ? `${prop.area?.toLocaleString()} sft · ${prop.buildingType}` : lead.id} · {inviteeCount} part{inviteeCount === 1 ? 'y' : 'ies'} invited</p>
                  </div>
                  <Button asChild size="sm" style={{background:'#6141ac',color:'#fff',flexShrink:0}}>
                    <a href={`/dashboard/leads/${lead.id}?tab=negotiation-board`}>Open Workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></a>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform deals */}
      {platformDeals.length > 0 && (
        <div className="space-y-3">
          {offPlatformDeals.length > 0 && (
            <h3 className="text-sm font-bold" style={{color:'#1e1537'}}>Platform Transactions</h3>
          )}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Requirements Summary</TableHead>
                    <TableHead>Listing(s)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformDeals.map(lead => (
                    <React.Fragment key={lead.id}>
                      <TableRow className="cursor-pointer hover:bg-secondary/30" onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                        <TableCell className="font-mono text-primary">{lead.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {lead.providers.map(p =>
                              p.properties.slice(0,1).map(prop => (
                                <div key={prop.listingId} className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-muted-foreground"/>
                                  <span className="text-sm font-mono text-primary">{prop.listingId}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              View Workspace <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
