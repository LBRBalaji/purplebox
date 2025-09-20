
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Mail, Phone, ThumbsUp, X, ArrowRight, UserCheck, Handshake, Building, Link2, Clock, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus, ListingSchema, RegisteredLeadProperty } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AcknowledgeLeadDialog } from './acknowledge-lead-dialog';
import { type AcknowledgmentDetails } from '@/lib/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const statusConfig: { [key in RegisteredLeadStatus]: { text: string; color: string, icon: React.ElementType } } = {
  Pending: { text: 'Pending', color: 'text-amber-600', icon: Clock },
  Acknowledged: { text: 'Acknowledged', color: 'text-green-600', icon: Check },
  Rejected: { text: 'Rejected', color: 'text-red-600', icon: X },
};

export function ProviderLeads() {
  const { user, users: allUsers, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads } = useData();
  
  const isAgent = user?.role === 'Agent';
  const isAdminOrO2O = user?.role === 'O2O' || user?.email === 'admin@example.com';

  const myLeads = React.useMemo(() => {
    if (!user) return [];
    
    if (isAdminOrO2O) {
        return registeredLeads.filter(lead => {
            const registeringUser = allUsers[lead.registeredBy];
            return lead.isO2OCollaborator || registeringUser?.role !== 'Agent';
        });
    }

    if (isAgent) {
        return registeredLeads.filter(lead => lead.registeredBy === user.email);
    }
    
    // Default to provider view
    return registeredLeads.filter(lead => 
      lead.providers.some(p => p.providerEmail === user.email)
    );
  }, [registeredLeads, user, isAgent, isAdminOrO2O, allUsers]);


  if (isAuthLoading) {
    return null; // Don't render until auth data is loaded
  }

  if (myLeads.length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>
                {isAgent ? 'You Have Not Registered Any Leads' : 'No Leads Registered With You'}
            </CardTitle>
            <CardDescription className="mt-2">
                 {isAgent ? 'Use the "Register New Lead" tab to get started.' : 'When the Lakshmi Balaji O2O team registers a new lead with you, it will appear here for your acknowledgment.'}
            </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <>
        <div className="mt-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">
                    {isAgent ? 'My Registered Leads' : 'My Leads & Proposals'}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {isAgent ? 'Track the status and activity of the leads you have registered.' : 'Review new leads, submit your commercial proposals, and manage transaction activities.'}
                </p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lead Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Requirements Summary</TableHead>
                                {isAgent || isAdminOrO2O ? (
                                  <>
                                    <TableHead>Developers</TableHead>
                                    <TableHead>Acknowledgment Status</TableHead>
                                  </>
                                ) : (
                                  <>
                                    <TableHead>Registered By</TableHead>
                                    <TableHead className="text-center">Your Status</TableHead>
                                  </>
                                )}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myLeads.map(lead => {
                                const providerInfoForCurrentUser = lead.providers.find(p => p.providerEmail === user?.email);
                                
                                return (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.leadName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{lead.leadContact}</span>
                                                <span className="text-xs text-muted-foreground">{lead.leadEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                                        
                                        {isAgent || isAdminOrO2O ? (
                                          <>
                                            <TableCell>
                                              <div className="flex flex-col gap-2">
                                                {lead.providers.map(p => {
                                                  if (isAuthLoading) return null;
                                                  const providerDetails = allUsers[p.providerEmail];
                                                  return <div key={p.providerEmail} className="text-sm">{providerDetails?.companyName || p.providerEmail}</div>
                                                })}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                               <TooltipProvider>
                                                <div className="flex flex-col gap-2">
                                                    {lead.providers.map(p => {
                                                        const properties = p.properties || [];
                                                        const total = properties.length;
                                                        const acknowledged = properties.filter(prop => prop.status === 'Acknowledged').length;
                                                        const rejected = properties.filter(prop => prop.status === 'Rejected').length;
                                                        const pending = total - acknowledged - rejected;
                                                        return (
                                                            <Tooltip key={p.providerEmail}>
                                                                <TooltipTrigger asChild>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Badge variant={pending > 0 ? "secondary" : "default"} className={cn(pending > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')}>{acknowledged}/{total} Ack.</Badge>
                                                                        {pending > 0 && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Acknowledged: {acknowledged}</p>
                                                                    <p>Pending: {pending}</p>
                                                                    <p>Rejected: {rejected}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    })}
                                                </div>
                                               </TooltipProvider>
                                            </TableCell>
                                          </>
                                        ) : (
                                          <>
                                            <TableCell>{allUsers[lead.registeredBy]?.companyName || lead.registeredBy}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col gap-2 items-center">
                                                {(providerInfoForCurrentUser?.properties || []).map(prop => {
                                                    const statusInfo = statusConfig[prop.status];
                                                    return (
                                                         <Badge key={prop.listingId} variant="outline" className={cn("font-medium", statusInfo.color)}>
                                                            <statusInfo.icon className="mr-1.5 h-3 w-3" />
                                                            {statusInfo.text}
                                                        </Badge>
                                                    )
                                                })}
                                                </div>
                                            </TableCell>
                                          </>
                                        )}

                                        <TableCell className="text-right">
                                            <div className="flex flex-col gap-2 items-end">
                                             <Button asChild variant="outline" size="sm">
                                                <Link href={`/dashboard/leads/${lead.id}`}>
                                                    View Activity <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </>
  )
}
