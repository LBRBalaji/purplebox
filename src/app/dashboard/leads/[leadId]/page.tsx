
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData, type TransactionActivity, type RegisteredLead, type RegisteredLeadProvider, type RegisteredLeadProperty } from '@/contexts/data-context';
import type { ListingSchema } from '@/lib/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineBody } from '@/components/ui/timeline';
import { Building, ClipboardList, HardHat, MessageSquare, Mic, User, Calendar as CalendarIcon, FileSpreadsheet, HandCoins, Warehouse, MapPin, Scaling, UserCheck, ArrowRight, Handshake, ThumbsDown, ThumbsUp, AlertCircle, Link2, Check, X, Clock, ShieldCheck, Briefcase } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';


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


export default function LeadDetailPage() {
  const { leadId } = useParams();
  const router = useRouter();
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, transactionActivities, listings, updateRegisteredLeadStatus, addTransactionActivity, isLoading: isDataLoading } = useData();
  const { toast } = useToast();

  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [activities, setActivities] = React.useState<TransactionActivity[]>([]);
  
  const [selectedProvider, setSelectedProvider] = React.useState<RegisteredLeadProvider | null>(null);
  const [selectedProviderListings, setSelectedProviderListings] = React.useState<ListingSchema[]>([]);
  
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = React.useState(false);
  const [propertyToAcknowledge, setPropertyToAcknowledge] = React.useState<RegisteredLeadProperty | null>(null);


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

    if (isSuperAdmin || isO2O || isProviderForThisLead || isCustomerOfThisLead || isAgentOfThisLead) {
        setLead(foundLead);
        const leadActivities = transactionActivities
            .filter(a => a.leadId === leadId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivities(leadActivities);
        
        // If there's only one provider, automatically select them
        if (foundLead.providers.length === 1) {
            const provider = foundLead.providers[0];
            const devListings = (provider.properties || []).map(p => listings.find(l => l.listingId === p.listingId)).filter((l): l is ListingSchema => !!l);
            setSelectedProvider(provider);
            setSelectedProviderListings(devListings);
        } else if (user?.role === 'Warehouse Developer') {
            // If user is a developer and there are multiple, auto-select their view
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
  
  const handleProviderSelect = (provider: RegisteredLeadProvider, devListings: ListingSchema[]) => {
      setSelectedProvider(provider);
      setSelectedProviderListings(devListings);
  }
  
  if (isAuthLoading || isDataLoading || !lead) {
    return <LeadDetailPageSkeleton />;
  }

  const customer = users[lead.customerId];
  const leadSourceUser = users[lead.registeredBy];
  const isO2O = user?.role === 'O2O' || user?.role === 'SuperAdmin';
  const isCustomer = user?.email === lead.customerId;
  const isAgent = user?.role === 'Agent';
  const isPremiumAgent = isAgent && user?.plan === 'Paid_Premium';
  const isProvider = user?.role === 'Warehouse Developer';

  const providerDetailsForUser = isProvider ? lead.providers.find(p => p.providerEmail === user?.email) : null;
  
  const backLink = isCustomer ? '/dashboard?tab=my-transactions' : isProvider ? '/dashboard?tab=registered-leads' : '/dashboard/transactions';

  const providerUser = selectedProvider ? users[selectedProvider.providerEmail] : null;

  return (
    <>
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
              <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="activity"><ClipboardList className="mr-2 h-4 w-4"/> Activity Log</TabsTrigger>
                      <TabsTrigger value="commercials"><HandCoins className="mr-2 h-4 w-4"/> Commercials</TabsTrigger>
                      <TabsTrigger value="improvements"><HardHat className="mr-2 h-4 w-4"/> Tenant Improvements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="activity" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                          <div className="md:col-span-2 space-y-6">
                              {(isO2O || isPremiumAgent || isCustomer) && <AddActivityForm leadId={lead.id} onAddActivity={handleAddActivity} />}
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
                              {providerUser && !isProvider && (
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5"/> Developer Info</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3 text-sm">
                                          <div className="font-semibold">{providerUser.companyName}</div>
                                          <div>{providerUser.userName}</div>
                                          <a href={`mailto:${providerUser.email}`} className="text-primary hover:underline block">{providerUser.email}</a>
                                          <a href={`tel:${providerUser.phone}`} className="text-primary hover:underline block">{providerUser.phone}</a>
                                      </CardContent>
                                  </Card>
                              )}
                              {isProvider && leadSourceUser && (
                                  <Card>
                                      <CardHeader>
                                          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5"/> Lead Source</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3 text-sm">
                                          <p>This lead was registered by:</p>
                                          <div className="font-semibold">{leadSourceUser.userName}</div>
                                          <div>{leadSourceUser.companyName}</div>
                                          <Badge variant={leadSourceUser.role === 'Agent' ? 'secondary' : 'default'}>{leadSourceUser.role}</Badge>
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
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-grow space-y-1">
                                                            <Link href={`/listings/${listing.listingId}`} target="_blank" className="font-semibold hover:underline">{listing.name}</Link>
                                                            <p className="text-xs text-muted-foreground">{listing.location} &bull; {listing.sizeSqFt.toLocaleString()} sq. ft.</p>
                                                        </div>
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                            <Link href={`/listings/${listing.listingId}`} target="_blank"><Link2 className="h-4 w-4" /></Link>
                                                        </Button>
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
    </>
  );
}
