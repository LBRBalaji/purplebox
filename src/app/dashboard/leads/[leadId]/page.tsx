
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData, type TransactionActivity, type RegisteredLead, type RegisteredLeadProvider } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineBody } from '@/components/ui/timeline';
import { Building, ClipboardList, HardHat, MessageSquare, Mic, User, Calendar as CalendarIcon, FileSpreadsheet, HandCoins, Warehouse, MapPin, Scaling, UserCheck, ArrowRight, Handshake, ThumbsDown, ThumbsUp, AlertCircle, Link2, Check, X } from 'lucide-react';
import { AddActivityForm } from '@/components/add-activity-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommercialTermsSheet } from '@/components/commercial-terms-sheet';
import { TenantImprovementsSheet } from '@/components/tenant-improvements-sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AcknowledgeLeadDialog } from '@/components/acknowledge-lead-dialog';
import type { AcknowledgmentDetails } from '@/lib/schema';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const activityIcons: { [key in TransactionActivity['activityType']]: React.ElementType } = {
  'Site Visit Request': CalendarIcon,
  'Site Visit Update': CalendarIcon,
  'Customer Feedback': MessageSquare,
  'Tenant Improvements': HardHat,
};

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
                    const devListings = (provider.listingIds || []).map(id => listings.find(l => l.listingId === id)).filter((l): l is ListingSchema => !!l);
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


export default function LeadDetailPage() {
  const { leadId } = useParams();
  const router = useRouter();
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, transactionActivities, listings, updateRegisteredLeadStatus, isLoading: isDataLoading } = useData();
  const { toast } = useToast();

  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [activities, setActivities] = React.useState<TransactionActivity[]>([]);
  
  const [selectedProvider, setSelectedProvider] = React.useState<RegisteredLeadProvider | null>(null);
  const [selectedProviderListings, setSelectedProviderListings] = React.useState<ListingSchema[]>([]);
  
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = React.useState(false);


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
    const isAgentOfThisLead = foundLead.registeredBy === user?.email;
    const isPremiumAgent = isAgentOfThisLead && user?.plan === 'Paid_Premium';

    if (isSuperAdmin || isO2O || isProviderForThisLead || isCustomerOfThisLead || isAgentOfThisLead) {
        setLead(foundLead);
        const leadActivities = transactionActivities
            .filter(a => a.leadId === leadId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivities(leadActivities);
        
        // If there's only one provider, automatically select them
        if (foundLead.providers.length === 1) {
            const provider = foundLead.providers[0];
            const devListings = (provider.listingIds || []).map(id => listings.find(l => l.listingId === id)).filter((l): l is ListingSchema => !!l);
            setSelectedProvider(provider);
            setSelectedProviderListings(devListings);
        }

    } else {
        router.push('/dashboard');
    }
  }, [leadId, registeredLeads, transactionActivities, user, router, isDataLoading, isAuthLoading, listings]);


  const handleAddActivity = (data: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
    // In a real app, this would be an API call. Here we simulate it.
    console.log("Activity to add:", data);
  };

  const handleAcknowledgeSubmit = (details: AcknowledgmentDetails) => {
    if (!lead || !user?.email) return;
    updateRegisteredLeadStatus(lead.id, user.email, 'Acknowledged', details);
    toast({
        title: 'Lead Acknowledged!',
        description: `Thank you for your confirmation. We look forward to a successful collaboration on this transaction.`,
    });
    setIsAcknowledgeDialogOpen(false);
  }
  
  const handleReject = () => {
    if (!lead || !user?.email) return;
    updateRegisteredLeadStatus(lead.id, user.email, 'Rejected');
    toast({
      title: 'Lead Rejected',
      description: `You have rejected the lead registration.`,
    });
    router.push('/dashboard'); // Go back to dashboard after rejecting
  }

  const handleProviderSelect = (provider: RegisteredLeadProvider, devListings: ListingSchema[]) => {
      setSelectedProvider(provider);
      setSelectedProviderListings(devListings);
  }
  
  if (isAuthLoading || isDataLoading || !lead) {
    return <LeadDetailPageSkeleton />;
  }

  const customer = users[lead.customerId];
  const isO2O = user?.role === 'O2O' || user?.role === 'SuperAdmin';
  const isCustomer = user?.email === lead.customerId;
  const isAgent = user?.role === 'Agent';
  const isPremiumAgent = isAgent && user?.plan === 'Paid_Premium';
  const isProvider = user?.role === 'Warehouse Developer';

  const providerDetailsForUser = lead.providers.find(p => p.providerEmail === user?.email);
  const isPendingAcknowledgement = isProvider && providerDetailsForUser?.status === 'Pending';
  
  const backLink = isCustomer ? '/dashboard?tab=my-transactions' : isProvider ? '/dashboard?tab=registered-leads' : '/dashboard/transactions';

  const providerUser = selectedProvider ? users[selectedProvider.providerEmail] : null;

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
              {lead.providers.length > 1 && selectedProvider ? (
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

          {isPendingAcknowledgement && (
             <Card className="mb-8 bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                       <AlertCircle className="h-5 w-5" /> Acknowledgment Required
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-700">Please review the details of this lead registration below and either acknowledge it to begin the transaction process or reject it if it's not a fit.</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject Lead
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to reject this lead?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. The O2O team will be notified of your decision.</AlertDialogDescription>
                            </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject}>Confirm Rejection</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => setIsAcknowledgeDialogOpen(true)}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> Acknowledge Lead
                    </Button>
                </CardFooter>
            </Card>
          )}

          {!selectedProvider ? (
              <DeveloperSelection lead={lead} onSelect={handleProviderSelect} />
          ) : (
              <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="activity"><ClipboardList className="mr-2 h-4 w-4"/> Activity Log</TabsTrigger>
                      <TabsTrigger value="commercials"><HandCoins className="mr-2 h-4 w-4"/> Commercials</TabsTrigger>
                      <TabsTrigger value="improvements"><HardHat className="mr-2 h-4 w-4"/> Tenant Improvements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="activity" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                          <div className="md:col-span-2 space-y-6">
                              {(isO2O || isPremiumAgent) && <AddActivityForm leadId={lead.id} onAddActivity={handleAddActivity} />}
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2">Activity Log</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                  {activities.length > 0 ? (
                                          <Timeline>
                                              {activities.map((activity) => {
                                                  const Icon = activityIcons[activity.activityType] || Mic;
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
                                                              <TimelineDescription>
                                                                  Logged by {activity.createdBy.replace('o2o@', 'O2O@')} on {new Date(activity.createdAt).toLocaleDateString()}
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
                              {!isCustomer && (
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Customer Info</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3 text-sm">
                                          <div className="font-semibold">{customer?.companyName || lead.leadName}</div>
                                          <div>{customer?.userName || lead.leadContact}</div>
                                          <a href={`mailto:${customer?.email || lead.leadEmail}`} className="text-primary hover:underline block">{customer?.email || lead.leadEmail}</a>
                                          <a href={`tel:${customer?.phone || lead.leadPhone}`} className="text-primary hover:underline block">{customer?.phone || lead.leadPhone}</a>
                                      </CardContent>
                                  </Card>
                              )}
                              {isCustomer && (
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5"/> Agent Info</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3 text-sm">
                                          <div className="font-semibold">Lakshmi Balaji Realty</div>
                                          <div>O2O Manager</div>
                                          <a href={`mailto:balaji@lakshmibalajio2o.com`} className="text-primary hover:underline block">balaji@lakshmibalajio2o.com</a>
                                          <a href={`tel:919841098170`} className="text-primary hover:underline block">+91 98410 98170</a>
                                      </CardContent>
                                  </Card>
                              )}
                               {selectedProviderListings.length > 0 && (
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5"/> Linked Properties</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                          {selectedProviderListings.map(listing => (
                                               <div key={listing.listingId} className="p-3 rounded-md border bg-secondary/50 flex justify-between items-center">
                                                  <div>
                                                      <p className="font-semibold text-primary block">{listing.name}</p>
                                                      <div className="text-sm mt-1"><MapPin className="inline-block h-4 w-4 mr-2 text-muted-foreground" />{listing.location}</div>
                                                      <div className="text-sm"><Scaling className="inline-block h-4 w-4 mr-2 text-muted-foreground" />{listing.sizeSqFt.toLocaleString()} sq. ft.</div>
                                                  </div>
                                                  <Button asChild variant="ghost" size="icon">
                                                      <Link href={`/listings/${listing.listingId}`} target="_blank">
                                                        <Link2 className="h-4 w-4" />
                                                      </Link>
                                                  </Button>
                                              </div>
                                          ))}
                                      </CardContent>
                                  </Card>
                              )}
                              <Card>
                                  <CardHeader>
                                      <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5"/> Developer</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4 text-sm">
                                      <p className="font-semibold">{providerUser?.companyName}</p>
                                      <p className="text-xs text-muted-foreground">{selectedProvider?.status}</p>
                                  </CardContent>
                              </Card>
                          </div>
                      </div>
                  </TabsContent>
                  <TabsContent value="commercials" className="mt-6">
                      <CommercialTermsSheet lead={lead} primaryListing={selectedProviderListings[0] || null} />
                  </TabsContent>
                   <TabsContent value="improvements" className="mt-6">
                      <TenantImprovementsSheet leadId={lead.id} />
                  </TabsContent>
              </Tabs>
          )}
        </div>
      </main>
      <AcknowledgeLeadDialog 
          isOpen={isAcknowledgeDialogOpen}
          onOpenChange={setIsAcknowledgeDialogOpen}
          lead={lead}
          onSubmit={handleAcknowledgeSubmit}
      />
    </>
  );
}
