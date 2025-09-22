
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
    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(ProposalFormSchema),
        defaultValues: {
            rentPerSft: typeof listing.rentPerSqFt === 'number' ? listing.rentPerSqFt : undefined,
            rentalSecurityDeposit: typeof listing.rentalSecurityDeposit === 'number' ? listing.rentalSecurityDeposit : undefined,
            actualChargeableArea: listing.sizeSqFt,
        }
    });

    const propertyInLead = provider.properties.find(p => p.listingId === listing.listingId);
    
    const submittedRent = propertyInLead?.rentPerSft;
    const submittedDeposit = propertyInLead?.rentalSecurityDeposit;
    const submittedArea = propertyInLead?.actualChargeableArea;


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
  const { registeredLeads, transactionActivities, listings, updateRegisteredLead, addTransactionActivity, isLoading: isDataLoading, addAgentToLead } = useData();
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
        setLead(foundLead);
        const leadActivities = transactionActivities
            .filter(a => a.leadId === leadId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivities(leadActivities);
        
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
  }, [leadId, registeredLeads, transactionActivities, user, router, isDataLoading, isAuthLoading, listings]);


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

  const canAddActivity = isO2O || isAgent || (!isBrokeredDeal && (isCustomer || isProvider));
  
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
        </div>

        {!selectedProvider ? (
            <DeveloperSelection lead={lead} onSelect={handleProviderSelect} />
        ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity"><ClipboardList className="mr-2 h-4 w-4"/> Activity Log</TabsTrigger>
                    <TabsTrigger value="negotiation-board"><FileSignature className="mr-2 h-4 w-4"/> Negotiation Board</TabsTrigger>
                    <TabsTrigger value="improvements"><HardHat className="mr-2 h-4 w-4"/> Tenant Improvements</TabsTrigger>
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
                                                                Logged by {users[activity.createdBy]?.userName || activity.createdBy} on {new Date(activity.createdAt).toLocaleDateString()}
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
                                            <p className="font-semibold">{isBrokeredDeal && (isProvider || isAgent) ? customer.companyName : customer.companyName}</p>
                                            <p className="text-xs">{isBrokeredDeal && (isProvider || isAgent) ? 'Details Private' : customer.userName}</p>
                                        </div>
                                    )}
                                    {providerUser && (
                                        <div className="p-3 bg-secondary/50 rounded-md">
                                            <p className="text-xs text-muted-foreground">Provider</p>
                                            <p className="font-semibold">{isBrokeredDeal && isCustomer ? 'Developer' : providerUser.companyName}</p>
                                            <p className="text-xs">{isBrokeredDeal && isCustomer ? 'Details Private' : providerUser.userName}</p>
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
                                                       {isProvider && !isBrokeredDeal && (
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
        )}
      </div>
    </main>
  );
}
