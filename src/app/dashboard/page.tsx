
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
import { ProviderLeads } from '@/components/provider-leads';
import { CustomerTransactions } from '@/components/customer-transactions';
import { AdminListings } from '@/components/admin-listings';

const MainDashboard = () => {
    const { user } = useAuth();
    const { submissions, listings } = useData();
    const searchParams = useSearchParams();
    const logNewDemand = searchParams.get('logNew') === 'true';
    const editDemandId = searchParams.get('editDemandId');
    const propertyMatchDemandId = searchParams.get('demandId');

    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isO2OManager = user?.role === 'O2O';
    const isProvider = user?.role === 'Warehouse Developer';
    const isCustomer = user?.role === 'User';
    const isAgent = user?.role === 'Agent';

    const [providerTab, setProviderTab] = React.useState('active-demands');
    const [customerTab, setCustomerTab] = React.useState('my-demands');
    const [adminTab, setAdminTab] = React.useState('approval-queue');
    const [superAdminTab, setSuperAdminTab] = React.useState('all-listings');
    const [agentTab, setAgentTab] = React.useState('active-demands');

    const hasPendingSubmissions = React.useMemo(() => {
        return submissions.some(s => s.status === 'Pending');
    }, [submissions]);

    const handleSwitchToMyDemands = React.useCallback(() => {
        setCustomerTab('my-demands');
    }, []);

    // Effect to switch tab based on URL params
    React.useEffect(() => {
      if (logNewDemand || editDemandId) {
        setCustomerTab('log-demand');
      } else if (propertyMatchDemandId) {
        setProviderTab('submit-match');
        setAdminTab('submit-match');
      }
    }, [logNewDemand, editDemandId, propertyMatchDemandId]);

    const renderProviderContent = () => (
      <Tabs value={providerTab} onValueChange={setProviderTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="registered-leads">Registered Leads</TabsTrigger>
          <TabsTrigger value="submit-match">Submit a Match</TabsTrigger>
        </TabsList>
        <TabsContent value="active-demands"><DemandList /></TabsContent>
        <TabsContent value="my-listings"><ProviderListings /></TabsContent>
        <TabsContent value="registered-leads"><ProviderLeads /></TabsContent>
        <TabsContent value="submit-match">
          <PropertyForm demandId={propertyMatchDemandId} />
        </TabsContent>
      </Tabs>
    );

    const renderCustomerContent = () => (
      <Tabs value={customerTab} onValueChange={setCustomerTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-demands">My Demands & Matches</TabsTrigger>
          <TabsTrigger value="log-demand">Log New Demand</TabsTrigger>
          <TabsTrigger value="my-transactions">My Transactions</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
        </TabsList>
        <TabsContent value="my-demands">
            <MyDemands onSwitchTab={setCustomerTab} />
        </TabsContent>
        <TabsContent value="log-demand">
          <DemandForm onDemandLogged={handleSwitchToMyDemands} />
        </TabsContent>
        <TabsContent value="my-transactions">
            <CustomerTransactions />
        </TabsContent>
        <TabsContent value="shortlisted">
            <ShortlistedProperties />
        </TabsContent>
      </Tabs>
    );
    
    // O2O Manager now has a more focused view
    const renderO2OContent = () => (
      <Tabs value={adminTab} onValueChange={setAdminTab}>
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approval-queue">
                Approval Queue 
                {hasPendingSubmissions && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-ping"></span>}
            </TabsTrigger>
            <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
            <TabsTrigger value="registered-leads">Registered Leads</TabsTrigger>
        </TabsList>
        <TabsContent value="approval-queue">
            <ApprovalQueue />
        </TabsContent>
        <TabsContent value="active-demands">
            <DemandList />
        </TabsContent>
         <TabsContent value="registered-leads">
            <ProviderLeads />
        </TabsContent>
      </Tabs>
    );

    // Agent gets a focused view for lead generation
    const renderAgentContent = () => (
        <Tabs value={agentTab} onValueChange={setAgentTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
                <TabsTrigger value="registered-leads">Registered Leads</TabsTrigger>
            </TabsList>
            <TabsContent value="active-demands">
                <DemandList />
            </TabsContent>
            <TabsContent value="registered-leads">
                <ProviderLeads />
            </TabsContent>
        </Tabs>
    );

    // Super Admin gets a super-view with all possible tabs
    const renderMainAdminContent = () => (
       <Tabs value={superAdminTab} onValueChange={setSuperAdminTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-listings">All Listings</TabsTrigger>
            <TabsTrigger value="all-demands">All Demands</TabsTrigger>
            <TabsTrigger value="all-submissions">All Submissions</TabsTrigger>
            <TabsTrigger value="all-leads">All Leads</TabsTrigger>
        </TabsList>
        <TabsContent value="all-listings">
            {superAdminTab === 'all-listings' && <AdminListings />}
        </TabsContent>
        <TabsContent value="all-demands">
            {superAdminTab === 'all-demands' && <DemandList />}
        </TabsContent>
        <TabsContent value="all-submissions">
            {superAdminTab === 'all-submissions' && <MySubmissions />}
        </TabsContent>
        <TabsContent value="all-leads">
            {superAdminTab === 'all-leads' && <ProviderLeads />}
        </TabsContent>
      </Tabs>
    );
    
    if (isSuperAdmin) {
        return renderMainAdminContent();
    } else if (isProvider) {
        return renderProviderContent();
    } else if (isCustomer) {
        return renderCustomerContent();
    } else if (isO2OManager) {
        return renderO2OContent();
    } else if (isAgent) {
        return renderAgentContent();
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
  const searchParams = useSearchParams();
  const propertyMatchDemandId = searchParams.get('demandId');

  // This key ensures the component re-mounts when the demandId changes,
  // which is crucial for the PropertyForm to get the correct initial state.
  const componentKey = propertyMatchDemandId || 'main-dashboard';

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <React.Suspense fallback={<div>Loading...</div>}>
            <MainDashboard key={componentKey} />
        </React.Suspense>
        <AdminNotifier />
      </div>
    </main>
  );
}
