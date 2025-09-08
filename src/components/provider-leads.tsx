
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Mail, Phone, ThumbsUp, X, ArrowRight, UserCheck, Handshake, Building, Link2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus, ListingSchema } from '@/contexts/data-context';
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

const statusConfig: { [key in RegisteredLeadStatus]: { text: string; color: string } } = {
  Pending: { text: 'Pending Acknowledgment', color: 'bg-amber-100 text-amber-800' },
  Acknowledged: { text: 'Acknowledged', color: 'bg-green-100 text-green-800' },
  Rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export function ProviderLeads() {
  const { user, users: allUsers, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, updateRegisteredLeadStatus, listings } = useData();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = React.useState<RegisteredLead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const isAgent = user?.role === 'Agent';

  const myLeads = React.useMemo(() => {
    if (!user) return [];
    const isAdminOrO2O = user.role === 'O2O' || user.email === 'admin@example.com';
    
    if (isAdminOrO2O) {
        return registeredLeads; // O2O and Admin see all leads
    }

    if (isAgent) {
        return registeredLeads.filter(lead => lead.registeredBy === user.email);
    }
    
    // Default to provider view
    return registeredLeads.filter(lead => 
      lead.providers.some(p => p.providerEmail === user.email)
    );
  }, [registeredLeads, user, isAgent]);

  const handleReject = (leadId: string, providerEmail: string) => {
    updateRegisteredLeadStatus(leadId, providerEmail, 'Rejected');
    toast({
      title: 'Lead Rejected',
      description: `You have rejected the lead registration.`,
    });
  }

  const handleAcknowledgeClick = (lead: RegisteredLead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };
  
  const handleAcknowledgeSubmit = (details: AcknowledgmentDetails) => {
    if (!selectedLead || !user?.email) return;
    updateRegisteredLeadStatus(selectedLead.id, user.email, 'Acknowledged', details);
    toast({
        title: 'Lead Acknowledged!',
        description: `Thank you for your confirmation. We look forward to a successful collaboration on this transaction.`,
    });
    setIsDialogOpen(false);
    setSelectedLead(null);
  }

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
                    {isAgent ? 'My Registered Leads' : 'Registered Leads'}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {isAgent ? 'Track the status and activity of the leads you have registered.' : 'Acknowledge or reject leads registered with you by the Lakshmi Balaji O2O team.'}
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
                                {isAgent ? (
                                  <>
                                    <TableHead>Developers</TableHead>
                                    <TableHead>Developer Acknowledgement</TableHead>
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
                                const providerInfo = lead.providers.find(p => p.providerEmail === user?.email);
                                const status = providerInfo ? statusConfig[providerInfo.status] : null;

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
                                        
                                        {isAgent ? (
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
                                              <div className="flex flex-col gap-2">
                                                {lead.providers.map(p => {
                                                  const providerStatus = statusConfig[p.status];
                                                  return <Badge key={p.providerEmail} variant="outline" className={cn(providerStatus?.color, "w-36 justify-center")}>{providerStatus?.text || p.status}</Badge>
                                                })}
                                              </div>
                                            </TableCell>
                                          </>
                                        ) : (
                                          <>
                                            <TableCell>{allUsers[lead.registeredBy]?.companyName || lead.registeredBy}</TableCell>
                                            <TableCell className="text-center">
                                                {status ? (
                                                    <Badge className={cn("text-xs", status.color)}>{status.text}</Badge>
                                                ) : (
                                                    <Badge variant="outline">View Status</Badge>
                                                )}
                                            </TableCell>
                                          </>
                                        )}

                                        <TableCell className="text-right">
                                            {providerInfo?.acknowledgedBy ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center justify-end">
                                                                <Badge variant="secondary" className="flex items-center gap-1.5 cursor-help">
                                                                    <UserCheck className="h-3 w-3"/>
                                                                    {providerInfo.acknowledgedBy.name}
                                                                </Badge>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className="p-1">
                                                              <p className="font-semibold">Acknowledged by:</p>
                                                              <p>{providerInfo.acknowledgedBy.name}, {providerInfo.acknowledgedBy.title}</p>
                                                              <p>{providerInfo.acknowledgedBy.email}</p>
                                                              <p>{providerInfo.acknowledgedBy.mobile}</p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            ) : providerInfo && providerInfo.status === 'Pending' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                          <Button size="sm" variant="outline">
                                                              <X className="mr-2 h-4 w-4" /> Reject
                                                          </Button>
                                                        </AlertDialogTrigger>
                                                         <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Confirm Rejection</AlertDialogTitle><AlertDialogDescription>Are you sure you want to reject this lead registration?</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleReject(lead.id, user!.email)}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm">
                                                                <Check className="mr-2 h-4 w-4" /> Acknowledge
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="sm:max-w-lg">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <Handshake className="h-5 w-5 text-primary"/>
                                                                    Review Lead Registration Details
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription asChild>
                                                                     <div className="text-left pt-2 space-y-4 text-sm text-muted-foreground">
                                                                        <div className="space-y-1">
                                                                            <p className="font-semibold text-foreground">Requirements Summary:</p>
                                                                            <p className="text-sm p-3 bg-secondary/50 rounded-md">{lead.requirementsSummary}</p>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                             <p className="font-semibold text-foreground">Linked Properties:</p>
                                                                             <div className="space-y-2">
                                                                                 {providerInfo.listingIds.map(id => {
                                                                                    const listing = listings.find(l => l.listingId === id);
                                                                                    return (
                                                                                        <div key={id} className="flex items-center gap-2 p-2 rounded-md border text-xs">
                                                                                            <Building className="h-4 w-4 text-muted-foreground shrink-0"/>
                                                                                            <div className="flex-grow">
                                                                                                <p className="font-medium text-foreground">{listing?.name || id}</p>
                                                                                                <p>{listing?.location}</p>
                                                                                            </div>
                                                                                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                                                                                <Link href={`/listings/${id}`} target="_blank"><Link2 className="h-3 w-3"/></Link>
                                                                                            </Button>
                                                                                        </div>
                                                                                    )
                                                                                 })}
                                                                             </div>
                                                                        </div>
                                                                        <p className="font-semibold text-foreground pt-2">
                                                                            By proceeding, you confirm your agreement to collaborate with Lakshmi Balaji O2O on this transaction.
                                                                        </p>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleAcknowledgeClick(lead)}>
                                                                    I Understand, Proceed
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ) : (
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/dashboard/leads/${lead.id}`}>
                                                        View Activities <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <AcknowledgeLeadDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            lead={selectedLead}
            onSubmit={handleAcknowledgeSubmit}
        />
    </>
  )
}
