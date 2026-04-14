
'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData, type TransactionActivity, type RegisteredLead, type RegisteredLeadProvider, type RegisteredLeadProperty, type Submission } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineBody } from '@/components/ui/timeline';
import { Building, ClipboardList, HardHat, MessageSquare, Mic, User, Calendar as CalendarIcon, FileSpreadsheet, HandCoins, Warehouse, MapPin, Scaling, UserCheck, ArrowRight, Handshake, ThumbsDown, ThumbsUp, AlertCircle, Link2, Check, X, Clock, ShieldCheck, Briefcase, FileSignature, DollarSign, Notebook, UserPlus, Users, ChevronsUpDown } from 'lucide-react';
import { AddActivityForm } from '@/components/add-activity-form';
import { EngagePathSelector } from '@/components/engage-path-selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NegotiationBoard } from '@/components/negotiation-board';
import { TenantImprovementsSheet } from '@/components/tenant-improvements-sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { AcknowledgmentDetails } from '@/lib/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ChatSubmission } from '@/components/chat-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const activityIcons: { [key in TransactionActivity['activityType']]: React.ElementType } = {
  'Quote Requested':    ClipboardList,
  'Quote Submitted':    FileSpreadsheet,
  'Site Visit Request': CalendarIcon,
  'Site Visit Update':  CalendarIcon,
  'Customer Feedback':  MessageSquare,
  'Tenant Improvements': HardHat,
  'Proposal Submitted': FileSpreadsheet,
  'Lead Acknowledged':  UserCheck,
  'Lead Registered':    UserPlus,
};

const ProposalFormSchema = z.object({
  rentPerSft: z.coerce.number().positive("Rent must be a positive number."),
  rentalSecurityDeposit: z.coerce.number().positive("Deposit must be positive."),
  actualChargeableArea: z.coerce.number().positive("Area must be positive."),
});
type ProposalFormValues = z.infer<typeof ProposalFormSchema>;


function LeadDetailPageSkeleton() {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <Skeleton className="h-8 w-48 mb-8" />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                 </div>
            </div>
        </main>
    )
}

function DeveloperSelection({ lead, onSelect }: { lead: RegisteredLead, onSelect: (provider: RegisteredLeadProvider, listings: ListingSchema[]) => void }) {
    const { users } = useAuth();
    const { listings } = useData();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Select a Developer to View Transaction</CardTitle>
                <CardDescription>This lead is registered with multiple developers. Select one to view the specific details of that engagement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {lead.providers.map(provider => {
                    const devUser = users[provider.providerEmail];
                    const devListings = (provider.properties || []).map(p => listings.find(l => l.listingId === p.listingId)).filter((l): l is ListingSchema => !!l);
                    return (
                        <button key={provider.providerEmail} onClick={() => onSelect(provider, devListings)} className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{devUser?.companyName || provider.providerEmail}</p>
                                <p className="text-sm text-muted-foreground">{devListings.length} propert{devListings.length === 1 ? 'y' : 'ies'} linked</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                    )
                })}
            </CardContent>
        </Card>
    )
}

function ProposalForm({ listing, lead, provider, onSubmit }: { listing: ListingSchema, lead: RegisteredLead, provider: RegisteredLeadProvider, onSubmit: (listingId: string, values: ProposalFormValues) => void }) {
    const { user } = useAuth();
    const isBrokeredDeal = lead.isO2OCollaborator;
    
    const propertyInLead = provider.properties.find(p => p.listingId === listing.listingId);
    
    const submittedRent = propertyInLead?.rentPerSft;
    const submittedDeposit = propertyInLead?.rentalSecurityDeposit;
    const submittedArea = propertyInLead?.actualChargeableArea;

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(ProposalFormSchema),
        defaultValues: {
            rentPerSft: typeof submittedRent === 'number' ? submittedRent : (typeof listing.rentPerSqFt === 'number' ? listing.rentPerSqFt : undefined),
            rentalSecurityDeposit: typeof submittedDeposit === 'number' ? submittedDeposit : (typeof listing.rentalSecurityDeposit === 'number' ? listing.rentalSecurityDeposit : undefined),
            actualChargeableArea: typeof submittedArea === 'number' ? submittedArea : listing.sizeSqFt,
        }
    });

    if (submittedRent !== undefined) {
        return (
            <div className="space-y-4">
                <p className="font-semibold text-primary">Proposal Submitted</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Quoted Rent</p>
                        <p className="font-medium">₹{submittedRent}/sft</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Chargeable Area</p>
                        <p className="font-medium">{submittedArea?.toLocaleString()} sft</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Security Deposit</p>
                        <p className="font-medium">{submittedDeposit} months</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => onSubmit(listing.listingId, values))} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="actualChargeableArea"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Actual Chargeable Area (SFT)</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rentPerSft"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quoted Rent per Sq. Ft.</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="rentalSecurityDeposit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Security Deposit (in months)</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="sm">Submit Proposal</Button>
            </form>
        </Form>
    )
}


function BrokerageAckPrompt({ lead, brokerName, transactionMode }: { lead: any; brokerName: string; transactionMode: string }) {
  const { updateRegisteredLead, addTransactionActivity } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [agreed, setAgreed] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleAcknowledge = async () => {
    if (!agreed) return;
    setSaving(true);
    try {
      updateRegisteredLead({ ...lead, brokerAcknowledged: true, brokerAcknowledgedAt: new Date().toISOString() });
      addTransactionActivity({
        leadId: lead.id,
        activityType: 'Lead Acknowledged',
        details: { message: `Brokerage acknowledged by ${user?.companyName}. Payable to ${brokerName} upon successful deal closure.` },
        createdBy: user?.email || '',
      });
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          id: `notif-brok-ack-${lead.id}-${Date.now()}`,
          type: 'new_activity',
          title: `Brokerage Acknowledged: ${lead.id}`,
          message: `${user?.companyName} formally acknowledged brokerage payable to ${brokerName} upon deal closure for transaction ${lead.id}.`,
          href: `/dashboard/leads/${lead.id}`,
          recipientEmail: lead.brokerEmail,
          timestamp: new Date().toISOString(),
          triggeredBy: user?.email || '',
          isRead: false,
        }]),
      }).catch(() => {});
      toast({ title: 'Brokerage Acknowledged', description: `${brokerName} has been notified of your commitment.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSaving(false);
  };

  return (
    <div style={{border:'1px solid hsl(259 44% 82%)'}}>
      <div className="px-4 py-3" style={{background:'hsl(259 44% 96%)'}}>
        <p className="text-sm font-bold" style={{color:'#1e1537'}}>Brokerage Acknowledgement Required</p>
        <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>
          {transactionMode === 'agent'
            ? `This transaction is represented by ${brokerName}. Please acknowledge the brokerage obligation.`
            : `ORS-ONE is the Transaction Partner for this deal. Please acknowledge the brokerage obligation.`}
        </p>
      </div>
      <div className="px-4 py-3 space-y-3" style={{background:'#fff'}}>
        <div className="px-4 py-3 text-xs leading-relaxed" style={{background:'hsl(259 30% 97%)',border:'1px solid hsl(259 30% 90%)'}}>
          {transactionMode === 'agent'
            ? `${brokerName} is the appointed agent/broker for this transaction. Industry standard brokerage is payable to ${brokerName} upon successful deal closure.`
            : `ORS-ONE (Lakshmi Balaji ORS Private Limited) is the Transaction Partner facilitating this deal. Industry standard brokerage is payable to ORS-ONE upon successful deal closure.`}
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-purple-600 flex-shrink-0" />
          <span className="text-xs" style={{color:'#1e1537',lineHeight:1.6}}>
            I, <strong>{user?.userName}</strong> ({user?.companyName}), formally acknowledge that industry standard brokerage is payable to <strong>{brokerName}</strong> upon successful deal closure for transaction <strong>{lead.id}</strong>. This is a binding commitment.
          </span>
        </label>
        <button onClick={handleAcknowledge} disabled={!agreed || saving}
          className="w-full py-2.5 text-sm font-bold text-white"
          style={{background: agreed && !saving ? '#6141ac' : 'hsl(259 30% 80%)', borderRadius:0, cursor: agreed ? 'pointer' : 'not-allowed'}}>
          {saving ? 'Saving...' : 'Confirm Brokerage Acknowledgement'}
        </button>
      </div>
    </div>
  );
}


export default function LeadDetailPage() {
  const { leadId } = useParams();
  const router = useRouter();
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, transactionActivities, listings, updateRegisteredLead, addTransactionActivity, isLoading: isDataLoading, addAgentToLead, getNegotiationBoard, getTenantImprovements, setActiveChat } = useData();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [activities, setActivities] = React.useState<TransactionActivity[]>([]);
  
  const [selectedProvider, setSelectedProvider] = React.useState<RegisteredLeadProvider | null>(null);
  const [selectedProviderListings, setSelectedProviderListings] = React.useState<ListingSchema[]>([]);
  const [agentToAdd, setAgentToAdd] = React.useState<string | null>(null);
  

  React.useEffect(() => {
    if (isDataLoading || isAuthLoading) return;
    
    const foundLead = registeredLeads.find(l => l.id === leadId);

    if (!foundLead) {
        if (!isDataLoading) router.push('/dashboard');
        return;
    }
    
    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isO2O = user?.role === 'O2O';
    const isProviderForThisLead = foundLead.providers.some(p => p.providerEmail === user?.email);
    const isCustomerOfThisLead = foundLead.customerId === user?.email;
    const isAgentOfThisLead = foundLead.agentId === user?.email;

    if (isSuperAdmin || isO2O || isProviderForThisLead || isCustomerOfThisLead || isAgentOfThisLead) {
        // Only update state if the found lead is different from the current one
        if (JSON.stringify(foundLead) !== JSON.stringify(lead)) {
            setLead(foundLead);
        }

        const leadActivities = transactionActivities
            .filter(a => a.leadId === leadId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Only update activities state if it has changed
        if (JSON.stringify(leadActivities) !== JSON.stringify(activities)) {
            setActivities(leadActivities);
        }
        
        if (foundLead.providers.length === 1) {
            const provider = foundLead.providers[0];
            const devListings = (provider.properties || []).map(p => listings.find(l => l.listingId === p.listingId)).filter((l): l is ListingSchema => !!l);
            setSelectedProvider(provider);
            setSelectedProviderListings(devListings);
        } else if (user?.role === 'Warehouse Developer') {
            const provider = foundLead.providers.find(p => p.providerEmail === user.email);
            if (provider) {
                const devListings = (provider.properties || []).map(p => listings.find(l => l.listingId === p.listingId)).filter((l): l is ListingSchema => !!l);
                setSelectedProvider(provider);
                setSelectedProviderListings(devListings);
            }
        }

    } else {
        router.push('/dashboard');
    }
  }, [leadId, registeredLeads, transactionActivities, user, router, isDataLoading, isAuthLoading, listings, lead, activities]);


  const handleAddActivity = (data: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
    addTransactionActivity(data);
    toast({
        title: "Activity Logged",
        description: "The new activity has been successfully saved.",
    });
  };

  const handleProposalSubmit = (listingId: string, values: ProposalFormValues) => {
    if (!lead || !selectedProvider || !user) return;
    
    const updatedLead = { ...lead };
    const providerIndex = updatedLead.providers.findIndex(p => p.providerEmail === selectedProvider.providerEmail);
    if(providerIndex === -1) return;

    const propertyIndex = updatedLead.providers[providerIndex].properties.findIndex(p => p.listingId === listingId);
    if(propertyIndex === -1) return;

    updatedLead.providers[providerIndex].properties[propertyIndex].rentPerSft = values.rentPerSft;
    updatedLead.providers[providerIndex].properties[propertyIndex].rentalSecurityDeposit = values.rentalSecurityDeposit;
    updatedLead.providers[providerIndex].properties[propertyIndex].actualChargeableArea = values.actualChargeableArea;
    
    addTransactionActivity({
        leadId: lead.id,
        activityType: 'Proposal Submitted',
        details: {
            listingId,
            rentPerSft: values.rentPerSft,
            rentalSecurityDeposit: values.rentalSecurityDeposit,
            actualChargeableArea: values.actualChargeableArea,
        },
        createdBy: user.email,
    });
    
    updateRegisteredLead(updatedLead);
    toast({ title: "Proposal Submitted", description: "The customer has been notified of your commercial proposal." });
  }
  
  const handleProviderSelect = (provider: RegisteredLeadProvider, devListings: ListingSchema[]) => {
      setSelectedProvider(provider);
      setSelectedProviderListings(devListings);
  }
  
  const customer = lead ? users[lead.customerId] : null;
  const providerUser = selectedProvider ? users[selectedProvider.providerEmail] : null;

  const isO2O = user?.role === 'O2O' || user?.role === 'SuperAdmin';
  const isProvider = user?.email === providerUser?.email;
  const isCustomer = user?.email === lead?.customerId;
  const isAgent = user?.email === lead?.agentId;

  const isBrokeredDeal = lead?.isO2OCollaborator;

   const handleAddAgent = (agentEmail: string) => {
    if (lead) {
        addAgentToLead(lead.id, agentEmail);
        toast({ title: 'Agent Added', description: 'The agent now has access to this transaction.' });
        setAgentToAdd(null);
    }
  };
  
  if (isAuthLoading || isDataLoading || !lead) {
    return <LeadDetailPageSkeleton />;
  }

  const agentUser = lead.agentId ? users[lead.agentId] : null;
  const allAgents = Object.values(users).filter(u => u.role === 'Agent');
  
  const primaryListingForTransaction = selectedProviderListings.length > 0 ? selectedProviderListings[0] : null;

  const canAddActivity = isO2O || isAgent || isCustomer;
  
  const getBackLink = () => {
    // This function determines where the 'Back' button navigates to.
    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isO2OManager = user?.role === 'O2O';
    const isAgent = user?.role === 'Agent';
    const isCustomer = user?.role === 'User';

    if (isCustomer) return '/dashboard?tab=my-transactions';
    
    if (isSuperAdmin || isO2OManager || isAgent) return '/dashboard/transactions';

    // Fallback for any other case, including Provider
    return '/dashboard/transactions';
  };
  
  const backLink = getBackLink();
  const defaultTab = searchParams.get('tab') || 'activity';

  // Journey stage computation (used in JSX below)
  const hasProposal = selectedProvider ? selectedProvider.properties.some(p => p.rentPerSft !== undefined) : false;
  const negotiation = lead ? getNegotiationBoard(lead.id) : null;
  const hasNegotiation = !!(negotiation && (negotiation as any).actionableItems?.length > 0);
  const tenantImpr = lead ? getTenantImprovements(lead.id) : null;
  const hasFitOut = !!(tenantImpr && ((tenantImpr as any).items?.length > 0 || (tenantImpr as any).requirements));
  const hasMoU = hasProposal && hasNegotiation && hasFitOut;

  const leadActivities = lead ? transactionActivities.filter((a: any) => a.leadId === lead.id) : [];
  // Quote stage done when: customer logged a Quote Requested activity OR lead was registered via Request Quote button
  const hasQuote = leadActivities.some((a: any) => a.activityType === 'Quote Requested');
  // Site visit done when a Site Visit Request activity exists
  const hasSiteVisit = leadActivities.some((a: any) => a.activityType === 'Site Visit Request');
  // Site visit confirmed when status is Visited
  const siteVisitDone = leadActivities.some((a: any) => a.activityType === 'Site Visit Update' && a.details?.status === 'Visited');
  const isOffPlatform = !!(lead as any)?.isOffPlatform;
  const transactionMode = (lead as any)?.transactionMode as string | undefined;
  const brokerName = (lead as any)?.brokerName as string | undefined;
  const brokerAcknowledged = !!(lead as any)?.brokerAcknowledged;

  const journeyStages = isOffPlatform ? [
    { key: 'registered',  label: 'Deal Registered', done: true,           sub: 'Off-Platform' },
    { key: 'termsheet',   label: 'Term Sheet',       done: hasNegotiation, sub: 'Commercial Terms' },
    { key: 'fitout',      label: 'Fit-Out',          done: hasFitOut,      sub: 'Requirements' },
    { key: 'mou',         label: 'MoU',              done: hasMoU,         sub: 'Finalised' },
  ] : [
    { key: 'chat',        label: 'Chat',        done: true,           sub: 'Connected' },
    { key: 'rfq',         label: 'Get Quote',   done: hasQuote,       sub: 'Formal RFQ' },
    { key: 'sitevisit',   label: 'Site Visit',  done: siteVisitDone,  sub: 'Inspected' },
    { key: 'negotiation', label: 'Negotiation', done: hasNegotiation, sub: 'Terms Agreed' },
    { key: 'fitout',      label: 'Fit-Out',     done: hasFitOut,      sub: 'Requirements' },
    { key: 'mou',         label: 'MoU',         done: hasMoU,         sub: 'Finalised' },
  ];
  const currentStageIdx = journeyStages.reduce((acc, s, i) => s.done ? i : acc, 0);

  const journeyNextAction = (() => {
    // Off-platform deals start directly at term sheet
    if (isOffPlatform) {
      if (!hasNegotiation)
        return { msg: 'Deal registered. Open the Negotiation Board to build the Commercial Term Sheet with all parties.', action: 'Build Term Sheet', tab: 'negotiation-board', highlight: true };
      if (!hasFitOut)
        return { msg: 'Term sheet in progress. Define fit-out and tenant improvement requirements next.', action: 'Define Fit-Out', tab: 'improvements', highlight: true };
      return { msg: 'All stages complete. Review and finalise the MoU with your legal counsel.', action: null, tab: null, highlight: false };
    }
    if (isProvider) {
      if (!hasQuote)
        return { msg: 'Customer has been connected. Waiting for them to raise a formal quote request.', action: null, tab: null, highlight: false };
      if (!hasProposal)
        return { msg: 'Customer has raised a formal quote request. Submit your commercial proposal — rent per sft, security deposit and lease tenure — via the Activity Log.', action: 'Submit Commercial Quote', tab: 'activity', highlight: true };
      if (!hasSiteVisit)
        return { msg: 'Quote submitted. Co-ordinate a site visit with the customer. They will log the request in the Activity Log.', action: null, tab: null, highlight: false };
      if (!siteVisitDone)
        return { msg: 'Site visit is scheduled. Update the visit status in the Activity Log once completed.', action: 'Update Site Visit', tab: 'activity', highlight: true };
      if (!hasNegotiation)
        return { msg: 'Site visit completed. Open the Negotiation Board to align on final commercial terms.', action: 'Open Negotiation Board', tab: 'negotiation-board', highlight: true };
      if (!hasFitOut)
        return { msg: "Negotiation in progress. Stay tuned for the customer's fit-out and tenant improvement requirements.", action: null, tab: null, highlight: false };
      return { msg: 'All stages complete. Review fit-out requirements and confirm with ORS-ONE for MoU.', action: null, tab: null, highlight: false };
    }
    if (isCustomer) {
      if (!hasQuote)
        return { msg: 'You are connected with the developer. Log a formal quote request to get accurate rent, deposit and lease terms.', action: 'Request Formal Quote', tab: 'activity', highlight: true };
      if (!hasProposal)
        return { msg: 'Quote requested. The developer will respond with current commercial terms. You will be notified.', action: null, tab: null, highlight: false };
      if (!hasSiteVisit)
        return { msg: 'Commercial terms received. Schedule a site visit to inspect the property before negotiating.', action: 'Schedule Site Visit', tab: 'activity', highlight: true };
      if (!siteVisitDone)
        return { msg: 'Site visit is scheduled. After the visit, log an update with your observations and feedback.', action: 'Log Site Visit Feedback', tab: 'activity', highlight: false };
      if (!hasNegotiation)
        return { msg: 'Site visit completed. Open the Negotiation Board to discuss and finalise commercial terms with the developer.', action: 'Start Negotiation', tab: 'negotiation-board', highlight: true };
      if (!hasFitOut)
        return { msg: 'Negotiation in progress. Define your warehouse fit-out and tenant improvement requirements.', action: 'Define Fit-Out Requirements', tab: 'improvements', highlight: true };
      return { msg: 'All stages complete. ORS-ONE will reach out to finalise the MoU.', action: null, tab: null, highlight: false };
    }
    if (isAgent) {
      if (!hasQuote)
        return { msg: 'Help your customer raise a formal quote request from the developer via the Activity Log.', action: 'Log Quote Request', tab: 'activity', highlight: true };
      if (!hasSiteVisit)
        return { msg: 'Quote has been requested. Schedule a site visit for your customer.', action: 'Schedule Site Visit', tab: 'activity', highlight: true };
      if (!siteVisitDone)
        return { msg: 'Site visit is scheduled. Log visit feedback once completed.', action: 'Update Site Visit', tab: 'activity', highlight: false };
      if (!hasNegotiation)
        return { msg: 'Site visit completed. Use the Negotiation Board to align terms between customer and developer.', action: 'Open Negotiation Board', tab: 'negotiation-board', highlight: true };
      return { msg: 'Deal progressing. Support your customer through fit-out requirements and MoU.', action: null, tab: null, highlight: false };
    }
    return null;
  })();
  
  // Activity type badge colours
  const activityBadge = (type: string) => {
    const map: Record<string, {bg: string, color: string}> = {
      'Quote Requested':     {bg:'hsl(259 44% 94%)', color:'#6141ac'},
      'Quote Submitted':     {bg:'hsl(259 44% 88%)', color:'#3b2870'},
      'Proposal Submitted':  {bg:'hsl(259 44% 94%)', color:'#6141ac'},
      'Lead Registered':     {bg:'#f0fdf4', color:'#15803d'},
      'Lead Acknowledged':   {bg:'#eff6ff', color:'#1d4ed8'},
      'Site Visit Request':  {bg:'#fdf4ff', color:'#7e22ce'},
      'Site Visit Update':   {bg:'#fdf4ff', color:'#7e22ce'},
      'Customer Feedback':   {bg:'#fff7ed', color:'#c2410c'},
      'Tenant Improvements': {bg:'#f0fdf4', color:'#15803d'},
    };
    return map[type] || {bg:'#f4f2fb', color:'#6141ac'};
  };

  return (
    <main style={{background:'#f4f2fb', minHeight:'100vh'}} className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
            {/* Back nav */}
            {lead.providers.length > 1 && selectedProvider && !isProvider ? (
                <button onClick={() => setSelectedProvider(null)}
                  className="mb-4 flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
                  style={{color:'#6141ac'}}>
                  <ArrowLeft className="h-4 w-4"/> Back to Developer Selection
                </button>
            ) : (
                <Link href={backLink}
                  className="mb-4 flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
                  style={{color:'#6141ac'}}>
                  <ArrowLeft className="h-4 w-4"/> Back to Transactions
                </Link>
            )}

            {/* Hero identity card */}
            {customer && providerUser && (
              <div className="rounded-2xl p-5 flex items-center gap-4 flex-wrap mt-2"
                style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
                <div className="w-full mb-1 flex items-center gap-2 flex-wrap">
                  {isOffPlatform && (
                    <span className="text-xs font-bold px-2 py-0.5" style={{background:'rgba(29,158,117,0.2)',color:'#1d9e75',border:'1px solid rgba(29,158,117,0.3)'}}>
                      Off-Platform Deal
                    </span>
                  )}
                  {(transactionMode === 'direct' || transactionMode === 'ors-tp') && (
                    <span className="text-xs font-bold px-2 py-0.5" style={{background:'rgba(97,65,172,0.35)',color:'#c5b8e8',border:'1px solid rgba(97,65,172,0.4)'}}>
                      ORS-ONE Transaction Partner
                    </span>
                  )}
                  {transactionMode === 'agent' && (
                    <span className="text-xs font-bold px-2 py-0.5" style={{background:'rgba(59,130,246,0.25)',color:'#93c5fd',border:'1px solid rgba(59,130,246,0.35)'}}>
                      Agent Represented — {brokerName}
                    </span>
                  )}
                  {brokerAcknowledged && (
                    <span className="text-xs font-bold px-2 py-0.5" style={{background:'rgba(34,197,94,0.2)',color:'#4ade80',border:'1px solid rgba(34,197,94,0.3)'}}>
                      ✓ Brokerage Confirmed
                    </span>
                  )}
                  {!transactionMode && !isOffPlatform && (
                    <span className="text-xs px-2 py-0.5" style={{color:'rgba(255,255,255,0.3)'}}>Engagement path pending</span>
                  )}
                  <span className="text-xs font-mono ml-auto" style={{color:'rgba(255,255,255,0.25)'}}>{lead.id}</span>
                </div>
                {/* Tenant */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{background:'hsl(259 44% 25%)',color:'#c5b8e8'}}>
                    {customer.companyName?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{color:'hsl(259 30% 55%)'}}>Tenant</p>
                    <p className="text-sm font-bold text-white truncate">{customer.companyName}</p>
                    <p className="text-xs" style={{color:'hsl(259 30% 60%)'}}>{customer.userName}</p>
                  </div>
                </div>
                {/* Divider */}
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{background:'hsl(259 44% 20%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b7ee0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </div>
                </div>
                {/* Provider */}
                <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{color:'hsl(259 30% 55%)'}}>Property Provider</p>
                    <p className="text-sm font-bold text-white truncate">{providerUser.companyName}</p>
                    <p className="text-xs" style={{color:'hsl(259 30% 60%)'}}>{providerUser.userName}</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{background:'hsl(259 44% 25%)',color:'#c5b8e8'}}>
                    {providerUser.companyName?.slice(0,2).toUpperCase()}
                  </div>
                </div>
                {/* Footer row */}
                {selectedProvider && (
                  <div className="w-full flex items-center justify-between pt-3 mt-1"
                    style={{borderTop:'1px solid hsl(259 25% 22%)'}}>
                    <div className="flex items-center gap-2">
                      <span style={{color:'#9b7ee0',fontSize:'11px'}}>✓</span>
                      <p className="text-xs" style={{color:'hsl(259 30% 55%)'}}>
                        Identities revealed · Transaction ID: <span className="font-mono" style={{color:'#9b7ee0'}}>{lead.id}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!selectedProvider || !lead) return;
                        const listing = selectedProviderListings[0] || null;
                        const customerUser = users[lead.customerId];
                        setActiveChat({
                          submissionId: `chat-${lead.id}-${selectedProvider.providerEmail}`,
                          demandId: lead.id,
                          listingId: listing?.listingId || '',
                          providerEmail: selectedProvider.providerEmail,
                          listing: listing || undefined,
                          customerName: customerUser?.userName || '',
                          customerId: lead.customerId,
                          customerCompany: customerUser?.companyName || '',
                          chatPartnerName: isCustomer
                            ? (listing ? [listing.warehouseBoxId, listing.listingId, listing.location?.split(',')[0]].filter(Boolean).join(' · ') : 'Developer')
                            : (customerUser?.companyName || 'Customer'),
                        } as any);
                        try { sessionStorage.setItem('openChatWidget', '1'); } catch {}
                        window.dispatchEvent(new CustomEvent('openChatWidget'));
                      }}
                      className="text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                      style={{color:'#9b7ee0'}}>
                      Continue in Chat →
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>

        {!selectedProvider ? (
            <DeveloperSelection lead={lead} onSelect={handleProviderSelect} />
        ) : (
            <div className="space-y-5">



              {/* Journey progress bar */}
              <div className="rounded-2xl p-5" style={{background:'#ffffff', border:'1px solid hsl(259 30% 88%)'}}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:'hsl(259 15% 50%)'}}>Transaction Journey</p>
                <div className="flex items-center gap-0">
                  {journeyStages.map((stage, i) => (
                    <React.Fragment key={stage.key}>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{minWidth:'52px'}}>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                          style={stage.done
                            ? {background:'#6141ac', color:'#ffffff'}
                            : i === currentStageIdx + 1
                            ? {background:'hsl(259 44% 94%)', color:'#6141ac', border:'2px solid #6141ac'}
                            : {background:'hsl(259 30% 92%)', color:'hsl(259 15% 60%)', border:'1px solid hsl(259 30% 84%)'}}>
                          {stage.done ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (i + 1)}
                        </div>
                        <span className="text-xs font-bold whitespace-nowrap text-center"
                          style={{color: stage.done ? '#6141ac' : i === currentStageIdx + 1 ? '#6141ac' : 'hsl(259 15% 60%)'}}>
                          {stage.label}
                        </span>
                        <span className="text-xs whitespace-nowrap text-center" style={{color:'hsl(259 15% 65%)', fontSize:'10px'}}>
                          {(stage as any).sub}
                        </span>
                      </div>
                      {i < journeyStages.length - 1 && (
                        <div className="flex-1 h-0.5 mb-7 mx-1 transition-all"
                          style={{background: stage.done ? '#6141ac' : 'hsl(259 30% 88%)'}} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Next action card */}
              {journeyNextAction && (
                <div className="rounded-2xl p-4 flex items-start justify-between gap-4"
                  style={journeyNextAction.highlight
                    ? {background:'hsl(259 25% 10%)', border:'1px solid hsl(259 25% 22%)'}
                    : {background:'hsl(259 44% 96%)', border:'1px solid hsl(259 44% 86%)'}}>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{background: journeyNextAction.highlight ? '#6141ac' : 'hsl(259 44% 88%)'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={journeyNextAction.highlight ? '#ffffff' : '#6141ac'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1"
                        style={{color: journeyNextAction.highlight ? '#9b7ee0' : '#6141ac'}}>Your Next Step</p>
                      <p className="text-sm leading-relaxed"
                        style={{color: journeyNextAction.highlight ? '#c5b8e8' : 'hsl(259 15% 35%)'}}>
                        {journeyNextAction.msg}
                      </p>
                    </div>
                  </div>
                  {journeyNextAction.action && journeyNextAction.tab && (
                    <button
                      onClick={() => {
                        // Switch to correct tab
                        const tabBtn = document.querySelector(`[data-value="${journeyNextAction.tab}"]`) as HTMLElement;
                        if (tabBtn) tabBtn.click();
                        // If going to activity log, pre-select the right activity type after a tick
                        if (journeyNextAction.tab === 'activity') {
                          setTimeout(() => {
                            const sel = document.querySelector('select[name="activityType"], [data-activity-type-select]') as HTMLSelectElement;
                            if (sel) {
                              if (journeyNextAction.action?.toLowerCase().includes('quote')) sel.value = 'Quote Requested';
                              else if (journeyNextAction.action?.toLowerCase().includes('site visit') || journeyNextAction.action?.toLowerCase().includes('schedule')) sel.value = 'Site Visit Request';
                              else if (journeyNextAction.action?.toLowerCase().includes('update') || journeyNextAction.action?.toLowerCase().includes('feedback')) sel.value = 'Site Visit Update';
                              sel.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            // Scroll to form
                            const form = document.querySelector('[data-add-activity-form]') as HTMLElement;
                            if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 150);
                        }
                      }}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
                      style={{background:'#6141ac', color:'#ffffff'}}>
                      {journeyNextAction.action} →
                    </button>
                  )}
                </div>
              )}

            {/* Workspace tabs */}
            <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 88%)'}}>
              <div className="flex" style={{background:'hsl(259 30% 96%)'}}>
                {[
                  ...(!isOffPlatform ? [{ value: 'activity', label: 'Activity Log', Icon: ClipboardList }] : []),
                  { value: 'negotiation-board', label: 'Term Sheet', Icon: FileSignature },
                  { value: 'improvements', label: 'Fit-Out', Icon: HardHat },
                ].map(({value, label, Icon}) => (
                  <button key={value}
                    data-value={value}
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('tab', value);
                      window.history.replaceState({}, '', url.toString());
                      document.querySelectorAll('[data-workspace-tab]').forEach(el => (el as HTMLElement).style.display = 'none');
                      const target = document.getElementById(`tab-${value}`);
                      if (target) target.style.display = 'block';
                      document.querySelectorAll('[data-tab-btn]').forEach(el => {
                        (el as HTMLElement).style.color = '#888';
                        (el as HTMLElement).style.borderBottom = '2px solid transparent';
                        (el as HTMLElement).style.background = 'transparent';
                      });
                      const btn = document.querySelector(`[data-tab-btn="${value}"]`) as HTMLElement;
                      if (btn) { btn.style.color = '#6141ac'; btn.style.borderBottom = '2px solid #6141ac'; btn.style.background = '#fff'; }
                    }}
                    data-tab-btn={value}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
                    style={defaultTab === value
                      ? {background:'#fff', color:'#6141ac', borderBottom:'2px solid #6141ac'}
                      : {background:'transparent', color:'#888', borderBottom:'2px solid transparent'}}>
                    <Icon className="h-3.5 w-3.5"/>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Activity Log tab */}
              <div id="tab-activity" data-workspace-tab style={{display: defaultTab === 'activity' ? 'block' : 'none', padding:'20px'}}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 space-y-4">
                    {/* Engage Path Selector — customer only */}
                    {isCustomer && <EngagePathSelector leadId={lead.id} />}

                    {/* Developer: brokerage acknowledgement prompt */}
                    {isProvider && transactionMode && !brokerAcknowledged && (
                      <BrokerageAckPrompt lead={lead} brokerName={brokerName || 'ORS-ONE'} transactionMode={transactionMode} />
                    )}

                    {/* Developer: pending amber banner */}
                    {isProvider && transactionMode && !brokerAcknowledged && (
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
                        <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <p className="text-xs font-semibold" style={{color:'#d97706'}}>Action required — brokerage acknowledgement pending for this transaction.</p>
                      </div>
                    )}

                    {/* Agent: role clarity banner */}
                    {isAgent && transactionMode === 'agent' && (
                      <div className="flex items-start gap-3 px-4 py-3" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{color:'#1e1537'}}>This is your transaction</p>
                          <p className="text-xs mt-0.5" style={{color:'hsl(259 15% 55%)'}}>ORS-ONE provides the platform tools only — Term Sheet, Fit-Out, and MoU workspace. ORS-ONE has no commercial role in this deal.</p>
                          {!brokerAcknowledged && (
                            <p className="text-xs mt-1 font-semibold" style={{color:'#d97706'}}>⏳ Brokerage acknowledgement pending from developer.</p>
                          )}
                          {brokerAcknowledged && (
                            <p className="text-xs mt-1 font-semibold" style={{color:'#15803d'}}>✓ Brokerage confirmed by developer on {new Date((lead as any)?.brokerAcknowledgedAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {canAddActivity && <div data-add-activity-form><AddActivityForm leadId={lead.id} onAddActivity={handleAddActivity} existingActivities={leadActivities} /></div>}
                    <div className="rounded-2xl p-5" style={{background:'#fff', border:'1px solid hsl(259 30% 91%)'}}>
                      <p className="text-sm font-bold mb-4" style={{color:'#1e1537'}}>Activity Log</p>
                      {activities.length > 0 ? (
                        <div className="space-y-0">
                          {activities.map((activity, idx) => {
                            const badge = activityBadge(activity.activityType);
                            const acknowledgedByDetails = activity.details.acknowledgedBy;
                            return (
                              <div key={activity.activityId} className="flex gap-3">
                                {/* Timeline line */}
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{background: badge.bg}}>
                                    <span style={{color: badge.color, fontSize:'12px'}}>●</span>
                                  </div>
                                  {idx < activities.length - 1 && <div className="w-0.5 flex-1 my-1" style={{background:'hsl(259 30% 91%)', minHeight:'16px'}}/>}
                                </div>
                                <div className="flex-1 pb-4" style={{paddingTop:'6px'}}>
                                  <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold" style={{color:'#1e1537'}}>{activity.activityType}</span>
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background: badge.bg, color: badge.color}}>{activity.activityType.split(' ')[0]}</span>
                                    </div>
                                    <span className="text-xs" style={{color:'#aaa'}}>{new Date(activity.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
                                  </div>
                                  <div className="mt-1.5 text-xs space-y-1" style={{color:'#555'}}>
                                    {activity.activityType === 'Lead Registered' && <p>Registered by <b>{users[activity.createdBy]?.userName || activity.createdBy}</b></p>}
                                    {activity.details.visitDateTime && <p><b>Date & Time:</b> {new Date(activity.details.visitDateTime).toLocaleString()}</p>}
                                    {activity.details.status && <p><b>Status:</b> <span style={{color:'#6141ac',fontWeight:600}}>{activity.details.status}</span></p>}
                                    {activity.details.message && <p><b>Message:</b> {activity.details.message}</p>}
                                    {activity.details.notes && <p><b>O2O Notes:</b> {activity.details.notes}</p>}
                                    {activity.details.feedbackText && <p><b>Feedback:</b> {activity.details.feedbackText}</p>}
                                    {activity.details.improvementsText && <p><b>Requirements:</b> {activity.details.improvementsText}</p>}
                                    {activity.activityType === 'Proposal Submitted' && activity.details.listingId && (
                                      <div className="mt-2 rounded-xl p-3" style={{background:'hsl(259 30% 97%)', border:'1px solid hsl(259 30% 91%)'}}>
                                        <div className="grid grid-cols-3 gap-3">
                                          <div><p className="text-xs" style={{color:'#aaa'}}>Listing</p><p className="text-sm font-bold" style={{color:'#1e1537'}}>{activity.details.listingId}</p></div>
                                          <div><p className="text-xs" style={{color:'#aaa'}}>Rent/sft</p><p className="text-sm font-bold" style={{color:'#1e1537'}}>₹{activity.details.rentPerSft}</p></div>
                                          <div><p className="text-xs" style={{color:'#aaa'}}>Area</p><p className="text-sm font-bold" style={{color:'#1e1537'}}>{activity.details.actualChargeableArea?.toLocaleString()} sft</p></div>
                                        </div>
                                      </div>
                                    )}
                                    {activity.activityType === 'Lead Acknowledged' && acknowledgedByDetails && (
                                      <p>Acknowledged by <b>{acknowledgedByDetails.name}</b> ({acknowledgedByDetails.title})</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <ClipboardList className="h-8 w-8 mx-auto mb-2" style={{color:'hsl(259 30% 80%)'}}/>
                          <p className="text-sm font-medium" style={{color:'#888'}}>No activities logged yet</p>
                          <p className="text-xs mt-1" style={{color:'#aaa'}}>Activities will appear here as the transaction progresses</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4 sticky top-6">
                    {/* Participants */}
                    <div className="rounded-2xl p-4" style={{background:'#fff', border:'1px solid hsl(259 30% 91%)'}}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:'#888'}}>Participants</p>
                      <div className="space-y-3">
                        {customer && (
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'hsl(259 44% 92%)',color:'#6141ac'}}>
                              {customer.companyName?.slice(0,2).toUpperCase()}
                            </div>
                            <div><p className="text-xs font-semibold" style={{color:'#1e1537'}}>{customer.companyName}</p><p className="text-xs" style={{color:'#aaa'}}>{customer.userName} · Customer</p></div>
                          </div>
                        )}
                        {providerUser && (
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'#eff6ff',color:'#1d4ed8'}}>
                              {providerUser.companyName?.slice(0,2).toUpperCase()}
                            </div>
                            <div><p className="text-xs font-semibold" style={{color:'#1e1537'}}>{providerUser.companyName}</p><p className="text-xs" style={{color:'#aaa'}}>{providerUser.userName} · Provider</p></div>
                          </div>
                        )}
                        {agentUser && (
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'#f0fdf4',color:'#15803d'}}>
                              {agentUser.companyName?.slice(0,2).toUpperCase()}
                            </div>
                            <div><p className="text-xs font-semibold" style={{color:'#1e1537'}}>{agentUser.companyName}</p><p className="text-xs" style={{color:'#aaa'}}>{agentUser.userName} · Agent</p></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Linked property */}
                    {selectedProviderListings.length > 0 && (
                      <div className="rounded-2xl p-4" style={{background:'#fff', border:'1px solid hsl(259 30% 91%)'}}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:'#888'}}>Linked Property</p>
                        {selectedProvider.properties.map((property, index) => {
                          const listing = listings.find(l => l.listingId === property.listingId);
                          if (!listing) return null;
                          return (
                            <div key={property.listingId}>
                              {index > 0 && <Separator className="my-3"/>}
                              <Link href={`/listings/${listing.listingId}`} target="_blank"
                                className="text-sm font-semibold hover:underline" style={{color:'#6141ac'}}>
                                {listing.name || listing.listingId}
                              </Link>
                              <p className="text-xs mt-1" style={{color:'#aaa'}}>{listing.location} · {listing.sizeSqFt?.toLocaleString()} sft</p>
                              {isProvider && (
                                <ProposalForm listing={listing} lead={lead} provider={selectedProvider} onSubmit={handleProposalSubmit} />
                              )}
                              {(isCustomer || isAgent || isO2O) && property.rentPerSft !== undefined && (
                                <div className="mt-3 rounded-xl p-3" style={{background:'hsl(259 30% 97%)', border:'1px solid hsl(259 30% 91%)'}}>
                                  <p className="text-xs font-bold mb-2" style={{color:'#6141ac'}}>Developer's Proposal</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div><p style={{color:'#aaa'}}>Rent/sft</p><p className="font-semibold" style={{color:'#1e1537'}}>₹{property.rentPerSft}</p></div>
                                    <div><p style={{color:'#aaa'}}>Area</p><p className="font-semibold" style={{color:'#1e1537'}}>{property.actualChargeableArea?.toLocaleString()} sft</p></div>
                                    <div><p style={{color:'#aaa'}}>Deposit</p><p className="font-semibold" style={{color:'#1e1537'}}>{property.rentalSecurityDeposit} months</p></div>
                                  </div>
                                </div>
                              )}
                              {(isCustomer || isAgent || isO2O) && property.rentPerSft === undefined && (
                                <p className="text-xs mt-2" style={{color:'#aaa'}}>Awaiting developer's proposal</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Agent facilitation */}
                    {(isO2O || isAgent) && (
                      <div className="rounded-2xl p-4" style={{background:'#fff', border:'1px solid hsl(259 30% 91%)'}}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:'#888'}}>Agent Facilitation</p>
                        {agentUser ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'#f0fdf4',color:'#15803d'}}>
                              {agentUser.companyName?.slice(0,2).toUpperCase()}
                            </div>
                            <div><p className="text-xs font-semibold" style={{color:'#1e1537'}}>{agentUser.userName}</p><p className="text-xs" style={{color:'#aaa'}}>{agentUser.companyName}</p></div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs" style={{color:'#888'}}>Add an agent to facilitate this transaction.</p>
                            <Select onValueChange={setAgentToAdd}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select an agent..." /></SelectTrigger>
                              <SelectContent>
                                {allAgents.map(agent => (
                                  <SelectItem key={agent.email} value={agent.email}>{agent.userName} ({agent.companyName})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" className="w-full text-xs" onClick={() => agentToAdd && handleAddAgent(agentToAdd)} disabled={!agentToAdd}>Confirm Agent</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Negotiation Board tab */}
              <div id="tab-negotiation-board" data-workspace-tab style={{display: defaultTab === 'negotiation-board' ? 'block' : 'none', padding:'20px'}}>
                <NegotiationBoard lead={lead} primaryListing={selectedProviderListings[0] || null} />
              </div>

              {/* Tenant Improvements tab */}
              <div id="tab-improvements" data-workspace-tab style={{display: defaultTab === 'improvements' ? 'block' : 'none', padding:'20px'}}>
                <TenantImprovementsSheet leadId={lead.id} />
              </div>
            </div>
            </div>
        )}
      </div>
    </main>
  );
}
