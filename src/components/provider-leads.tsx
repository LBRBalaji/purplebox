'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Mail, Phone, ThumbsUp, X, ArrowRight, UserCheck, Handshake, Building, Link2, Clock, HelpCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus, ListingSchema, RegisteredLeadProperty } from '@/contexts/data-context';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AcknowledgeLeadDialog } from './acknowledge-lead-dialog';
import { type AcknowledgmentDetails } from '@/lib/schema';
import { useRouter } from 'next/navigation';
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

export function ProviderLeads({ view = 'default' }: { view?: 'default' | 'broking' }) {
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, acknowledgeLeadProperties } = useData();
  const router = useRouter();
  const { toast } = useToast();

  const [leadToAcknowledge, setLeadToAcknowledge] = React.useState<RegisteredLead | null>(null);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = React.useState(false);
  
  const isAgent = user?.role === 'Agent';
  const isAdminOrO2O = user?.role === 'O2O' || user?.role === 'SuperAdmin';
  const isProvider = user?.role === 'Warehouse Developer';

  const myLeads = React.useMemo(() => {
    if (!user) return [];

    if (isAdminOrO2O) {
      if (view === 'broking') {
        return registeredLeads.filter(lead => lead.isO2OCollaborator);
      }
      return registeredLeads; // Show all leads for default admin view
    }
    
    if (isAgent) {
        return registeredLeads.filter(lead => lead.registeredBy === user.email);
    }
    
    // For providers, show direct leads AND brokered leads they are a part of.
    return registeredLeads.filter(lead => 
      lead.providers.some(p => p.providerEmail === user.email)
    );
  }, [registeredLeads, user, isAgent, isAdminOrO2O, view]);
  
  const handleRegisterWithProvider = (lead: RegisteredLead) => {
    const query = new URLSearchParams();
    query.set('tab', 'register');
    query.set('prefillFromLead', lead.id);
    router.push(`/dashboard/transactions?${query.toString()}`);
  };

  const handleAcknowledgeClick = (lead: RegisteredLead) => {
    setLeadToAcknowledge(lead);
    setIsAcknowledgeDialogOpen(true);
  };
  
  const handleAcknowledgeSubmit = (details: AcknowledgmentDetails) => {
    if (leadToAcknowledge && user?.email) {
      acknowledgeLeadProperties(leadToAcknowledge.id, user.email, details);
      toast({
        title: "Lead Acknowledged",
        description: `You have successfully acknowledged lead ${leadToAcknowledge.id}.`
      });
    }
    setIsAcknowledgeDialogOpen(false);
    setLeadToAcknowledge(null);
  }


  if (isAuthLoading) {
    return null; // Don't render until auth data is loaded
  }

  if (myLeads.length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>
                {view === 'broking'
                    ? 'No Broking Leads Found'
                    : isAgent
                    ? 'You Have Not Registered Any Leads'
                    : 'No Leads Found'}
            </CardTitle>
            <CardDescription className="mt-2">
                 {view === 'broking'
                    ? 'Leads from free listings will appear here.'
                    : isAgent 
                    ? 'Use the "Register New Lead" tab to get started.' 
                    : 'When a new lead is registered with you, it will appear here.'}
            </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <>
        <div className="mt-8">
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
                                const hasPending = isProvider && providerInfoForCurrentUser?.properties.some(p => p.status === 'Pending');
                                
                                const registeredByO2O = users[lead.registeredBy];

                                let contactToShow = { name: lead.leadContact, email: lead.leadEmail };
                                if (isProvider && lead.isO2OCollaborator && registeredByO2O) {
                                    contactToShow = { name: registeredByO2O.userName, email: registeredByO2O.email };
                                }


                                return (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.isO2OCollaborator && isProvider ? lead.id : lead.leadName}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span>{contactToShow.name}</span>
                                                <span className="text-xs text-muted-foreground">{contactToShow.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{lead.requirementsSummary}</TableCell>
                                        
                                        {isAgent || isAdminOrO2O ? (
                                          <>
                                            <TableCell>
                                              <div className="flex flex-col gap-2">
                                                {lead.providers.map(p => {
                                                  if (isAuthLoading) return null;
                                                  const providerDetails = users[p.providerEmail];
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
                                            <TableCell>{users[lead.registeredBy]?.companyName || lead.registeredBy}</TableCell>
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
                                              {hasPending ? (
                                                  <Button size="sm" onClick={() => handleAcknowledgeClick(lead)}>
                                                      <Handshake className="mr-2 h-4 w-4" /> Acknowledge Lead
                                                  </Button>
                                              ) : (
                                                  <Button asChild variant="outline" size="sm">
                                                      <Link href={`/dashboard/leads/${lead.id}`}>
                                                          View Activity <ArrowRight className="ml-2 h-4 w-4" />
                                                      </Link>
                                                  </Button>
                                              )}
                                            {isAdminOrO2O && lead.isO2OCollaborator && (
                                                <Button size="sm" onClick={() => handleRegisterWithProvider(lead)}>
                                                    <UserPlus className="mr-2 h-4 w-4" /> Register with Provider
                                                </Button>
                                            )}
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
        <AcknowledgeLeadDialog 
            isOpen={isAcknowledgeDialogOpen}
            onOpenChange={setIsAcknowledgeDialogOpen}
            lead={leadToAcknowledge}
            onSubmit={handleAcknowledgeSubmit}
        />
    </>
  )
}
