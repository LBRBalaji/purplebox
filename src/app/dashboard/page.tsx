
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import Link from 'next/link';
import { MyDemands } from '@/components/my-demands';
import { MySubmissions } from '@/components/my-submissions';
import { ShortlistedProperties } from '@/components/shortlisted-properties';
import { DemandList } from '@/components/demand-list';
import { PropertyForm } from '@/components/property-form';
import { AdminNotifier } from '@/components/admin-notifier';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemandForm } from '@/components/demand-form';
import { ProviderListings } from '@/components/provider-listings';

const MainDashboard = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const logNewDemand = searchParams.get('logNew') === 'true';
    const editDemandId = searchParams.get('editDemandId');
    const propertyMatchDemandId = searchParams.get('demandId');

    const isProvider = user?.role === 'SuperAdmin' && user.email !== 'admin@example.com';
    const isAdmin = user?.email === 'admin@example.com';
    const isTenant = user?.role === 'User';
    const isO2O = user?.role === 'O2O';

    const [activeTab, setActiveTab] = React.useState('active-demands');
    const [myDemandsTab, setMyDemandsTab] = React.useState('my-demands');
    const [newMatchCount, setNewMatchCount] = React.useState(0); // This would be derived from data context in a real app

    const handleSwitchToMyDemands = React.useCallback(() => {
        setMyDemandsTab('my-demands');
    }, []);

    // Effect to switch tab based on URL params
    React.useEffect(() => {
      if (logNewDemand || editDemandId) {
        setMyDemandsTab('log-demand');
      } else if (propertyMatchDemandId) {
        setActiveTab('submit-match');
      }
    }, [logNewDemand, editDemandId, propertyMatchDemandId]);


    const renderProviderContent = () => (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
          <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
           <TabsTrigger value="my-listings">My Listings & Performance</TabsTrigger>
          <TabsTrigger value="submit-match">Submit a Match</TabsTrigger>
        </TabsList>
        <TabsContent value="active-demands"><DemandList /></TabsContent>
        <TabsContent value="my-submissions"><MySubmissions /></TabsContent>
        <TabsContent value="my-listings"><ProviderListings /></TabsContent>
        <TabsContent value="submit-match"><PropertyForm /></TabsContent>
      </Tabs>
    );

    const renderTenantContent = () => (
      <Tabs value={myDemandsTab} onValueChange={setMyDemandsTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-demands">My Demands & Matches {newMatchCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{newMatchCount}</span>}</TabsTrigger>
          <TabsTrigger value="log-demand">Log New Demand</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>
        <TabsContent value="my-demands">
            <MyDemands onSwitchTab={setMyDemandsTab} newMatchCount={newMatchCount} />
        </TabsContent>
        <TabsContent value="log-demand">
          <DemandForm onDemandLogged={handleSwitchToMyDemands} />
        </TabsContent>
        <TabsContent value="shortlisted">
            <ShortlistedProperties />
        </TabsContent>
      </Tabs>
    );

    const renderAdminContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>O2O Manager Dashboard</CardTitle>
                <CardDescription>
                    Manage listings, users, and platform settings from the navigation menu.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                    <p>Admin-specific dashboard components are available in the header.</p>
                     <p className="text-xs mt-2">(e.g., Approval Queue, User Management, Analytics)</p>
                </div>
            </CardContent>
        </Card>
    );
    
    if (isProvider) {
        return renderProviderContent();
    }
    if (isTenant) {
        return renderTenantContent();
    }
    if (isAdmin || isO2O) {
        return renderAdminContent();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Please wait while we load your dashboard.</CardDescription>
            </CardHeader>
        </Card>
    );
};


export default function DashboardPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <React.Suspense fallback={<div>Loading...</div>}>
            <MainDashboard />
        </React.Suspense>
        <AdminNotifier />
      </div>
    </main>
  );
}
