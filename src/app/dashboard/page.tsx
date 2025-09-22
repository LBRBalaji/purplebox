
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemandForm } from '@/components/demand-form';
import { MyDemands } from '@/components/my-demands';
import { MySubmissions } from '@/components/my-submissions';
import { ApprovalQueue } from '@/components/approval-queue';
import { useData } from '@/contexts/data-context';
import { ProviderListings } from '@/components/provider-listings';
import { ProviderLeads } from '@/components/provider-leads';
import { CustomerTransactions } from '@/components/customer-transactions';
import { AdminListings } from '@/components/admin-listings';
import { TransactionsPage } from '@/components/transactions-page';
import { GeneralShortlist } from '@/components/general-shortlist';
import { DemandList } from '@/components/demand-list';

const MainDashboard = () => {
    const { user } = useAuth();
    const { submissions } = useData();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Read URL params to control active tabs
    const defaultTabParam = searchParams.get('tab');
    const logNewDemand = searchParams.get('logNew') === 'true';
    const editDemandId = searchParams.get('editDemandId');
    const propertyMatchDemandId = searchParams.get('demandId');

    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isO2OManager = user?.role === 'O2O';
    const isProvider = user?.role === 'Warehouse Developer';
    const isCustomer = user?.role === 'User';
    const isAgent = user?.role === 'Agent';

    // State for each role's dashboard tabs
    const [providerTab, setProviderTab] = React.useState(defaultTabParam || 'registered-leads');
    const [customerTab, setCustomerTab] = React.useState(defaultTabParam || 'my-transactions');
    const [adminTab, setAdminTab] = React.useState(defaultTabParam || 'approval-queue');
    const [agentTab, setAgentTab] = React.useState(defaultTabParam || 'transactions');

    const hasPendingSubmissions = React.useMemo(() => {
        return submissions.some(s => s.status === 'Pending');
    }, [submissions]);

    const handleSwitchToMyDemands = React.useCallback(() => {
        setCustomerTab('my-demands');
    }, []);

    // Effect to switch tab based on URL params for specific actions
    React.useEffect(() => {
      if (logNewDemand || editDemandId) {
        setCustomerTab('log-demand');
      } else if (propertyMatchDemandId) {
        setProviderTab('submit-match');
        setAdminTab('submit-match');
      } else if (defaultTabParam) {
        if (isProvider) setProviderTab(defaultTabParam);
        if (isCustomer) setCustomerTab(defaultTabParam);
        if (isO2OManager) setAdminTab(defaultTabParam);
        if (isAgent) setAgentTab(defaultTabParam);
      } else {
        if (isProvider) setProviderTab('registered-leads');
        if (isCustomer) setCustomerTab('my-transactions');
      }
    }, [logNewDemand, editDemandId, propertyMatchDemandId, defaultTabParam, isProvider, isCustomer, isO2OManager, isAgent]);

    const renderProviderContent = () => (
      <Tabs value={providerTab} onValueChange={setProviderTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="registered-leads">My Leads & Proposals</TabsTrigger>
          <TabsTrigger value="submit-match">Submit a Match</TabsTrigger>
        </TabsList>
        <TabsContent value="my-listings"><ProviderListings /></TabsContent>
        <TabsContent value="registered-leads"><ProviderLeads /></TabsContent>
        <TabsContent value="submit-match">
          <DemandForm demandId={propertyMatchDemandId} />
        </TabsContent>
      </Tabs>
    );

    const renderCustomerContent = () => (
      <Tabs value={customerTab} onValueChange={setCustomerTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-demands">My Demands & Matches</TabsTrigger>
          <TabsTrigger value="log-demand">Log New Demand</TabsTrigger>
          <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
          <TabsTrigger value="my-transactions">My Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="my-demands">
            <MyDemands onSwitchTab={setCustomerTab} />
        </TabsContent>
        <TabsContent value="log-demand">
          <DemandForm onDemandLogged={handleSwitchToMyDemands} />
        </TabsContent>
        <TabsContent value="my-shortlist">
            <GeneralShortlist />
        </TabsContent>
        <TabsContent value="my-transactions">
            <CustomerTransactions />
        </TabsContent>
      </Tabs>
    );
    
    const renderO2OContent = () => (
      <Tabs value={adminTab} onValueChange={setAdminTab}>
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approval-queue">
                Approval Queue 
                {hasPendingSubmissions && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-ping"></span>}
            </TabsTrigger>
            <TabsTrigger value="active-demands">Active Demands</TabsTrigger>
            <TabsTrigger value="registered-leads">All Leads</TabsTrigger>
            <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
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
        <TabsContent value="my-shortlist">
            <GeneralShortlist />
        </TabsContent>
      </Tabs>
    );

    const renderAgentContent = () => (
        <Tabs value={agentTab} onValueChange={setAgentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
                <TransactionsPage />
            </TabsContent>
            <TabsContent value="my-shortlist">
                <GeneralShortlist />
            </TabsContent>
        </Tabs>
    );

    const renderMainAdminContent = () => (
       <Tabs defaultValue="all-listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all-listings">All Listings</TabsTrigger>
            <TabsTrigger value="all-demands">All Demands</TabsTrigger>
        </TabsList>
        <TabsContent value="all-listings">
            <AdminListings />
        </TabsContent>
        <TabsContent value="all-demands">
            <DemandList />
        </TabsContent>
      </Tabs>
    );
    
    if (isSuperAdmin) {
        return renderMainAdminContent();
    } else if (isO2OManager) {
        return renderO2OContent();
    } else if (isAgent) {
        return renderAgentContent();
    } else if (isProvider) {
        return renderProviderContent();
    } else if (isCustomer) {
        return renderCustomerContent();
    }

    return null;
};


export default function DashboardPage() {
  const searchParams = useSearchParams();
  const propertyMatchDemandId = searchParams.get('demandId');

  const componentKey = propertyMatchDemandId || 'main-dashboard';

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <React.Suspense fallback={<div>Loading...</div>}>
            <MainDashboard key={componentKey} />
        </React.Suspense>
      </div>
    </main>
  );
}
