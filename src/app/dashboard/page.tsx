
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemandForm } from '@/components/demand-form';
import { MyDemands } from '@/components/my-demands';
import { MySubmissions } from '@/components/my-submissions';
import { ShortlistedProperties } from '@/components/shortlisted-properties';
import { DemandList } from '@/components/demand-list';
import { PropertyForm } from '@/components/property-form';
import { AdminNotifier } from '@/components/admin-notifier';
import { ApprovalQueue } from '@/components/approval-queue';
import { useData } from '@/contexts/data-context';
import { ProviderListings } from '@/components/provider-listings';

const MainDashboard = () => {
    const { user } = useAuth();
    const { submissions } = useData();
    const searchParams = useSearchParams();
    const logNewDemand = searchParams.get('logNew') === 'true';
    const editDemandId = searchParams.get('editDemandId');
    const propertyMatchDemandId = searchParams.get('demandId');

    const isProvider = user?.role === 'SuperAdmin' && user.email !== 'admin@example.com';
    const isTenant = user?.role === 'User';
    const isAdminOrO2O = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    const [providerTab, setProviderTab] = React.useState('active-demands');
    const [tenantTab, setTenantTab] = React.useState('my-demands');
    const [adminTab, setAdminTab] = React.useState('approval-queue');

    const hasPendingSubmissions = React.useMemo(() => {
        return submissions.some(s => s.status === 'Pending');
    }, [submissions]);

    const handleSwitchToMyDemands = React.useCallback(() => {
        setTenantTab('my-demands');
    }, []);

    // Effect to switch tab based on URL params
    React.useEffect(() => {
      if (logNewDemand || editDemandId) {
        setTenantTab('log-demand');
      } else if (propertyMatchDemandId) {
        setProviderTab('submit-match');
        setAdminTab('submit-match');
      }
    }, [logNewDemand, editDemandId, propertyMatchDemandId]);


    const renderProviderContent = () => (
      <Tabs value={providerTab} onValueChange={setProviderTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
          <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
           <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="submit-match">Submit a Match</TabsTrigger>
        </TabsList>
        <TabsContent value="active-demands"><DemandList /></TabsContent>
        <TabsContent value="my-submissions"><MySubmissions /></TabsContent>
        <TabsContent value="my-listings"><ProviderListings /></TabsContent>
        <TabsContent value="submit-match"><PropertyForm /></TabsContent>
      </Tabs>
    );

    const renderTenantContent = () => (
      <Tabs value={tenantTab} onValueChange={setTenantTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-demands">My Demands & Matches</TabsTrigger>
          <TabsTrigger value="log-demand">Log New Demand</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>
        <TabsContent value="my-demands">
            <MyDemands onSwitchTab={setTenantTab} />
        </TabsContent>
        <TabsContent value="log-demand">
          <DemandForm onDemandLogged={handleSwitchToMyDemands} />
        </TabsContent>
        <TabsContent value="shortlisted">
            <ShortlistedProperties />
        </TabsContent>
      </Tabs>
    );
    
    // Main Admin and O2O Manager now see a more focused dashboard.
    // Urgent tasks (approvals) are shown first.
    const renderAdminAndO2OContent = () => (
      <Tabs value={adminTab} onValueChange={setAdminTab}>
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approval-queue">
                Approval Queue 
                {hasPendingSubmissions && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-ping"></span>}
            </TabsTrigger>
            <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
            <TabsTrigger value="submit-match">Submit a Match</TabsTrigger>
        </TabsList>
        <TabsContent value="approval-queue">
            <ApprovalQueue />
        </TabsContent>
        <TabsContent value="active-demands">
            <DemandList />
        </TabsContent>
        <TabsContent value="submit-match">
            <PropertyForm />
        </TabsContent>
      </Tabs>
    );
    
    if (isProvider) {
        return renderProviderContent();
    }
    if (isTenant) {
        return renderTenantContent();
    }
    if (isAdminOrO2O) {
        return renderAdminAndO2OContent();
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
