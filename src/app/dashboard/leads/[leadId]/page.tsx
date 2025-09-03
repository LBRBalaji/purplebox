
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData, type TransactionActivity, type RegisteredLead } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineTitle, TimelineIcon, TimelineDescription, TimelineBody } from '@/components/ui/timeline';
import { Building, ClipboardList, HardHat, MessageSquare, Mic, User, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
import { AddActivityForm } from '@/components/add-activity-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommercialTermsSheet } from '@/components/commercial-terms-sheet';

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

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const router = useRouter();
  const { user, users, isLoading: isAuthLoading } = useAuth();
  const { registeredLeads, transactionActivities, addTransactionActivity, isLoading: isDataLoading } = useData();

  const [lead, setLead] = React.useState<RegisteredLead | null>(null);
  const [activities, setActivities] = React.useState<TransactionActivity[]>([]);

  React.useEffect(() => {
    if (isDataLoading || isAuthLoading) return;
    
    const foundLead = registeredLeads.find(l => l.id === leadId);

    if (!foundLead) {
        if (!isDataLoading) router.push('/dashboard');
        return;
    }

    const isAdminOrO2O = user?.role === 'O2O' || user?.email === 'admin@example.com';
    const isProviderForThisLead = foundLead.providers.some(p => p.providerEmail === user?.email);

    if (isAdminOrO2O || isProviderForThisLead) {
        setLead(foundLead);
        const leadActivities = transactionActivities
            .filter(a => a.leadId === leadId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivities(leadActivities);
    } else {
        router.push('/dashboard');
    }
  }, [leadId, registeredLeads, transactionActivities, user, router, isDataLoading, isAuthLoading]);

  const handleAddActivity = (data: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
    addTransactionActivity(data);
  };
  
  if (isAuthLoading || isDataLoading || !lead) {
    return <LeadDetailPageSkeleton />;
  }

  const customer = users[lead.customerId];
  const isAdminOrO2O = user?.role === 'O2O' || user?.email === 'admin@example.com';


  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
             <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard/register-lead">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Transactions
                </Link>
            </Button>
            <h2 className="text-3xl font-bold font-headline tracking-tight">Transaction Details</h2>
            <p className="text-muted-foreground mt-2">
                Tracking all activities for Transaction ID: <span className="font-mono text-primary">{lead.id}</span>
            </p>
        </div>
        <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity"><ClipboardList className="mr-2 h-4 w-4"/> Activity Log</TabsTrigger>
                <TabsTrigger value="commercials"><FileSpreadsheet className="mr-2 h-4 w-4"/> Commercials</TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6">
                        {isAdminOrO2O && <AddActivityForm leadId={lead.id} onAddActivity={handleAddActivity} />}
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
                                                            Logged by {activity.createdBy} on {new Date(activity.createdAt).toLocaleDateString()}
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
                                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Lead Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="font-semibold">{customer?.companyName || lead.leadName}</div>
                                <div>{customer?.userName || lead.leadContact}</div>
                                <a href={`mailto:${customer?.email || lead.leadEmail}`} className="text-primary hover:underline block">{customer?.email || lead.leadEmail}</a>
                                <a href={`tel:${customer?.phone || lead.leadPhone}`} className="text-primary hover:underline block">{customer?.phone || lead.leadPhone}</a>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5"/> Involved Providers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {lead.providers.map((p: any) => {
                                    const providerUser = Object.values(users).find(u => u.email === p.providerEmail);
                                    return (
                                        <div key={p.providerEmail} className="text-sm">
                                            <p className="font-semibold">{providerUser?.companyName}</p>
                                            <p className="text-xs text-muted-foreground">{p.status}</p>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="commercials" className="mt-6">
                <CommercialTermsSheet lead={lead} />
            </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
