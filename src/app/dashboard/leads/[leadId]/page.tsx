
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
  'Site Visit Request': CalendarIcon,
  'Site Visit Update': CalendarIcon,
  'Customer Feedback': MessageSquare,
  'Tenant Improvements': HardHat,
  'Proposal Submitted': FileSpreadsheet,
  'Lead Acknowledged': UserCheck,
  'Lead Registered': UserPlus,
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

  const journeyStages = [
    { key: 'chat', label: 'Chat', done: true },
    { key: 'proposal', label: 'Proposal', done: hasProposal },
    { key: 'negotiation', label: 'Negotiation', done: hasNegotiation },
    { key: 'fitout', label: 'Fit-Out', done: hasFitOut },
    { key: 'mou', label: 'MoU', done: hasMoU },
  ];
  const currentStageIdx = journeyStages.reduce((acc, s, i) => s.done ? i : acc, 0);

  const journeyNextAction = (() => {
    if (isProvider) {
      if (!hasProposal) return { msg: 'Submit your commercial proposal to start the negotiation.', action: 'Submit Proposal', tab: 'activity', highlight: true };
      if (!hasNegotiation) return { msg: 'Proposal submitted. Open the Negotiation Board to align on terms with the customer.', action: 'Go to Negotiation Board', tab: 'negotiation-board', highlight: false };
      if (!hasFitOut) return { msg: "Terms are being discussed. Stay tuned for the customer's fit-out requirements.", action: null, tab: null, highlight: false };
      return { msg: 'Deal progressing well. Review fit-out requirements and confirm with ORS-ONE for MoU.', action: null, tab: null, highlight: false };
    }
    if (isCustomer) {
      if (!hasProposal) return { msg: 'Waiting for the developer to submit their commercial proposal.', action: null, tab: null, highlight: false };
      if (!hasNegotiation) return { msg: 'Developer has submitted a proposal. Review it and open the Negotiation Board to discuss terms.', action: 'Review & Negotiate', tab: 'negotiation-board', highlight: true };
      if (!hasFitOut) return { msg: 'Negotiation in progress. Define your fit-out and warehouse requirements next.', action: 'Define Fit-Out Requirements', tab: 'improvements', highlight: true };
      return { msg: 'All stages complete. ORS-ONE will reach out to finalise the MoU.', action: null, tab: null, highlight: false };
    }
    return null;
  })();
  
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            {lead.providers.length > 1 && selectedProvider && !isProvider ? (
                <Button variant="ghost" onClick={() => setSelectedProvider(null)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Developer Selection
                </Button>
            ) : (
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={backLink}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
                    </Link>
                </Button>
            )}
            <h2 className="text-3xl font-bold font-headline tracking-tight">Transaction Details</h2>
            <p className="text-muted-foreground mt-2">
                Tracking all activities for Transaction ID: <span className="font-mono text-primary">{lead.id}</span>
            </p>

            {/* Identity reveal banner — shown only on transaction page */}
            {customer && providerUser && (
              <div className="mt-5 rounded-2xl p-4 flex items-center gap-4 flex-wrap"
                style={{background:'hsl(259 25% 11%)', border:'1px solid hsl(259 25% 22%)'}}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:'hsl(259 44% 25%)'}}>
                    <span className="text-xs font-black" style={{color:'#c5b8e8'}}>{customer.companyName?.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{color:'hsl(259 30% 55%)'}}>Tenant</p>
                    <p className="text-sm font-bold text-white truncate">{customer.companyName}</p>
                    <p className="text-xs" style={{color:'hsl(259 30% 60%)'}}>{customer.userName}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 px-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{background:'hsl(259 44% 20%)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b7ee0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{color:'hsl(259 30% 55%)'}}>Property Provider</p>
                    <p className="text-sm font-bold text-white truncate">{providerUser.companyName}</p>
                    <p className="text-xs" style={{color:'hsl(259 30% 60%)'}}>{providerUser.userName}</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{background:'hsl(259 44% 25%)'}}>
                    <span className="text-xs font-black" style={{color:'#c5b8e8'}}>{providerUser.companyName?.slice(0,2).toUpperCase()}</span>
                  </div>
                </div>
                {/* Back to chat link */}
                {selectedProvider && (
                  <div className="w-full border-t pt-3 mt-1 flex items-center justify-between" style={{borderColor:'hsl(259 25% 22%)'}}>
                    <p className="text-xs" style={{color:'hsl(259 30% 55%)'}}>
                      <span style={{color:'#9b7ee0'}}>✓</span> Identities revealed — you are now in the Transaction Workspace
                    </p>
                    <button
                      onClick={() => {
                        if (!selectedProvider || !lead) return;
                        const listing = selectedProviderListings[0] || null;
                        const customerUser = users[lead.customerId];
                        const provUser = users[selectedProvider.providerEmail];
                        const threadId = `chat-${lead.id}-${selectedProvider.providerEmail}`;
                        setActiveChat({
                          submissionId: threadId,
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
                        // Signal global widget to open
                        try { sessionStorage.setItem('openChatWidget', '1'); } catch {}
                        window.dispatchEvent(new CustomEvent('openChatWidget'));
                      }}
                      className="text-xs font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                      style={{color:'#9b7ee0'}}>
                      ← Continue in Chat
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
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
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
                        <span className="text-xs font-semibold whitespace-nowrap"
                          style={{color: stage.done ? '#6141ac' : i === currentStageIdx + 1 ? '#6141ac' : 'hsl(259 15% 60%)'}}>
                          {stage.label}
                        </span>
                      </div>
                      {i < journeyStages.length - 1 && (
                        <div className="flex-1 h-0.5 mb-5 mx-1 transition-all"
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
                        const tab = document.querySelector(`[data-value="${journeyNextAction.tab}"]`) as HTMLElement;
                        if (tab) tab.click();
                      }}
                      className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 whitespace-nowrap"
                      style={{background:'#6141ac', color:'#ffffff'}}>
                      {journeyNextAction.action} →
                    </button>
                  )}
                </div>
              )}

            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity" data-value="activity"><ClipboardList className="mr-2 h-4 w-4"/> Activity Log</TabsTrigger>
                    <TabsTrigger value="negotiation-board" data-value="negotiation-board"><FileSignature className="mr-2 h-4 w-4"/> Negotiation Board</TabsTrigger>
                    <TabsTrigger value="improvements" data-value="improvements"><HardHat className="mr-2 h-4 w-4"/> Tenant Improvements</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        <div className="md:col-span-2 space-y-6">
                            {canAddActivity && <AddActivityForm leadId={lead.id} onAddActivity={handleAddActivity} />}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">Activity Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                {activities.length > 0 ? (
                                        <Timeline>
                                            {activities.map((activity) => {
                                                const Icon = activityIcons[activity.activityType] || Mic;
                                                const acknowledgedByDetails = activity.details.acknowledgedBy;
                                                return(
                                                    <TimelineItem key={activity.activityId}>
                                                        <TimelineConnector />
                                                        <TimelineHeader>
                                                            <TimelineIcon><Icon /></TimelineIcon>
                                                            <TimelineTitle>{activity.activityType}</TimelineTitle>
                                                        </TimelineHeader>
                                                        <TimelineBody className="space-y-2">
                                                            {activity.activityType === 'Lead Registered' && <p className="text-sm">Lead registered by <b>{users[activity.createdBy]?.userName || activity.createdBy}</b>.</p>}
                                                            {activity.details.visitDateTime && <p className="text-sm"><b>Date & Time:</b> {new Date(activity.details.visitDateTime).toLocaleString()}</p>}
                                                            {activity.details.status && <p className="text-sm"><b>Status:</b> <span className="font-semibold text-primary">{activity.details.status}</span></p>}
                                                            {activity.details.message && <p className="text-sm"><b>Message:</b> {activity.details.message}</p>}
                                                            {activity.details.notes && <p className="text-sm"><b>O2O Notes:</b> {activity.details.notes}</p>}
                                                            {activity.details.feedbackText && <p className="text-sm"><b>Feedback:</b> {activity.details.feedbackText}</p>}
                                                            {activity.details.improvementsText && <p className="text-sm"><b>Requirements:</b> {activity.details.improvementsText}</p>}
                                                            {activity.activityType === 'Proposal Submitted' && activity.details.listingId && (
                                                                <div className="text-sm space-y-1">
                                                                    <p><b>For Listing:</b> {activity.details.listingId}</p>
                                                                    <p><b>Rent:</b> ₹{activity.details.rentPerSft}/sft</p>
                                                                    <p><b>Deposit:</b> {activity.details.rentalSecurityDeposit} months</p>
                                                                    <p><b>Area:</b> {activity.details.actualChargeableArea?.toLocaleString()} sft</p>
                                                                </div>
                                                            )}
                                                            {activity.activityType === 'Lead Acknowledged' && acknowledgedByDetails && (
                                                                <div className="text-sm space-y-1">
                                                                    <p>Lead formally acknowledged by <b>{acknowledgedByDetails.name}</b> ({acknowledgedByDetails.title}) from the provider's side.</p>
                                                                </div>
                                                            )}
                                                            <TimelineDescription>
                                                                Logged by {users[activity.createdBy]?.userName || activity.createdBy} on {new Date(activity.createdAt).toLocaleString()}
                                                            </TimelineDescription>
                                                        </TimelineBody>
                                                    </TimelineItem>
                                                )
                                            })}
                                        </Timeline>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No activities have been logged for this lead yet.</p>
                                    </div>
                                )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6 sticky top-24">
                             <Card>
                                <CardHeader>
                                  <CardTitle>Participants</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4 text-sm">
                                    {customer && (
                                        <div className="p-3 bg-secondary/50 rounded-md">
                                            <p className="text-xs text-muted-foreground">Customer</p>
                                            <p className="font-semibold">{customer.companyName}</p>
                                            <p className="text-xs">{customer.userName}</p>
                                        </div>
                                    )}
                                    {providerUser && (
                                        <div className="p-3 bg-secondary/50 rounded-md">
                                            <p className="text-xs text-muted-foreground">Provider</p>
                                            <p className="font-semibold">{providerUser.companyName}</p>
                                            <p className="text-xs">{providerUser.userName}</p>
                                        </div>
                                    )}
                                    {agentUser && (
                                        <div className="p-3 bg-secondary/50 rounded-md">
                                            <p className="text-xs text-muted-foreground">Agent</p>
                                            <p className="font-semibold">{agentUser.companyName}</p>
                                            <p className="text-xs">{agentUser.userName}</p>
                                        </div>
                                    )}
                                  </div>
                                </CardContent>
                             </Card>
                             { (isO2O || isAgent) && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Agent Facilitation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {agentUser ? (
                                      <div className="p-3 bg-secondary/50 rounded-md text-sm">
                                        <p className="font-semibold">Facilitated by:</p>
                                        <p>{agentUser.userName} ({agentUser.companyName})</p>
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Add an agent to facilitate this transaction.</p>
                                        <Select onValueChange={setAgentToAdd}>
                                            <SelectTrigger><SelectValue placeholder="Select an agent..." /></SelectTrigger>
                                            <SelectContent>
                                                {allAgents.map(agent => (
                                                    <SelectItem key={agent.email} value={agent.email}>{agent.userName} ({agent.companyName})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button size="sm" className="w-full" onClick={() => agentToAdd && handleAddAgent(agentToAdd)} disabled={!agentToAdd}>Confirm Agent</Button>
                                      </div>
                                  )}
                                </CardContent>
                              </Card>
                             )}

                             {selectedProviderListings.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5"/> Linked Properties</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          {selectedProvider.properties.map((property, index) => {
                                              const listing = listings.find(l => l.listingId === property.listingId);
                                              if (!listing) return null;
                                              
                                              return (
                                                <React.Fragment key={property.listingId}>
                                                  {index > 0 && <Separator />}
                                                  <div className="space-y-3">
                                                      <div className="flex items-start justify-between gap-4">
                                                          <div className="flex-grow space-y-1">
                                                              <Link href={`/listings/${listing.listingId}`} target="_blank" className="font-semibold hover:underline">{listing.name}</Link>
                                                              <p className="text-xs text-muted-foreground">{listing.location} &bull; {listing.sizeSqFt.toLocaleString()} sq. ft.</p>
                                                          </div>
                                                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                              <Link href={`/listings/${listing.listingId}`} target="_blank"><Link2 className="h-4 w-4" /></Link>
                                                          </Button>
                                                      </div>
                                                       {isProvider && (
                                                          <ProposalForm 
                                                              listing={listing} 
                                                              lead={lead} 
                                                              provider={selectedProvider} 
                                                              onSubmit={handleProposalSubmit} 
                                                          />
                                                      )}
                                                       {(isCustomer || isAgent || isO2O) && (
                                                          <div className="p-3 bg-secondary/50 rounded-md">
                                                              <p className="text-sm font-semibold mb-2 text-primary">Developer's Proposal</p>
                                                              {property.rentPerSft !== undefined ? (
                                                                   <div className="grid grid-cols-2 gap-4 text-sm">
                                                                      <div>
                                                                          <p className="text-muted-foreground">Quoted Rent</p>
                                                                          <p className="font-medium">₹{property.rentPerSft}/sft</p>
                                                                      </div>
                                                                       <div>
                                                                          <p className="text-muted-foreground">Chargeable Area</p>
                                                                          <p className="font-medium">{property.actualChargeableArea?.toLocaleString()} sft</p>
                                                                      </div>
                                                                      <div>
                                                                          <p className="text-muted-foreground">Security Deposit</p>
                                                                          <p className="font-medium">{property.rentalSecurityDeposit} months</p>
                                                                      </div>
                                                                  </div>
                                                              ) : (
                                                                  <p className="text-sm text-muted-foreground">Waiting for developer to submit their proposal.</p>
                                                              )}
                                                          </div>
                                                      )}
                                                  </div>
                                                </React.Fragment>
                                              )
                                          })}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="negotiation-board" className="mt-6">
                    <NegotiationBoard lead={lead} primaryListing={selectedProviderListings[0] || null} />
                </TabsContent>
                 <TabsContent value="improvements" className="mt-6">
                    <TenantImprovementsSheet leadId={lead.id} />
                </TabsContent>
            </Tabs>
            </div>
        )}
      </div>
    </main>
  );
}
