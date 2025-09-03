
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Mail, Phone, ThumbsUp, X, ArrowRight, UserCheck, Handshake } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import type { RegisteredLead, RegisteredLeadStatus } from '@/contexts/data-context';
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
  Pending: { text: 'Pending Your Acknowledgment', color: 'bg-amber-100 text-amber-800' },
  Acknowledged: { text: 'Acknowledged', color: 'bg-green-100 text-green-800' },
  Rejected: { text: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export function ProviderLeads() {
  const { user } = useAuth();
  const { registeredLeads, updateRegisteredLeadStatus } = useData();
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = React.useState<RegisteredLead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);


  const myLeads = React.useMemo(() => {
    if (!user) return [];
    const isAdminOrO2O = user.role === 'O2O' || user.email === 'admin@example.com';
    if (isAdminOrO2O) {
        return registeredLeads; // O2O and Admin see all leads
    }
    return registeredLeads.filter(lead => 
      lead.providers.some(p => p.providerEmail === user.email)
    );
  }, [registeredLeads, user]);

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

  if (myLeads.length === 0) {
    return (
      <div className="mt-8">
        <Card className="text-center p-12">
            <CardTitle>No Leads Registered With You</CardTitle>
            <CardDescription className="mt-2">When the Lakshmi Balaji O2O team registers a new lead with you, it will appear here for your acknowledgment.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <>
        <div className="mt-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">Registered Leads</h2>
                <p className="text-muted-foreground mt-2">Acknowledge or reject leads registered with you by the Lakshmi Balaji O2O team.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lead Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Requirements Summary</TableHead>
                                <TableHead>Registered By</TableHead>
                                <TableHead className="text-center">Your Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myLeads.map(lead => {
                                const providerInfo = lead.providers.find(p => p.providerEmail === user?.email);
                                // For O2O/Admin, we just need a status to display. We can show a summary or the status of the first provider.
                                // Here, we'll just determine the status for the logged-in user if they are a provider.
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
                                        <TableCell>{lead.registeredBy}</TableCell>
                                        <TableCell className="text-center">
                                            {status ? (
                                                <Badge className={cn("text-xs", status.color)}>{status.text}</Badge>
                                            ) : (
                                                <Badge variant="outline">View Status</Badge>
                                            )}
                                        </TableCell>
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
                                                            <p className="font-semibold">Acknowledged by:</p>
                                                            <p>{providerInfo.acknowledgedBy.name}, {providerInfo.acknowledgedBy.title}</p>
                                                            <p>{providerInfo.acknowledgedBy.email}</p>
                                                            <p>{providerInfo.acknowledgedBy.mobile}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            ) : providerInfo && providerInfo.status === 'Pending' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => handleReject(lead.id, user!.email)}>
                                                        <X className="mr-2 h-4 w-4" /> Reject
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm">
                                                                <Check className="mr-2 h-4 w-4" /> Acknowledge
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <Handshake className="h-5 w-5 text-primary"/>
                                                                    Confirm Lead Acknowledgment
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-left pt-2 space-y-3">
                                                                    <p>
                                                                        By proceeding, you are formally acknowledging this lead registration. This step confirms your agreement to collaborate with Lakshmi Balaji O2O on this transaction.
                                                                    </p>
                                                                    <p className="font-semibold text-foreground">
                                                                        Please be aware that this action signifies the start of our professional engagement for this specific lead and is non-revocable.
                                                                    </p>
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
