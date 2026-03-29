
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
import { Building2, Eye, Download, TrendingUp, Users, ShieldCheck, CheckCircle2, AlertCircle, Scaling } from 'lucide-react';
import { ProviderLeads } from '@/components/provider-leads';
import { CustomerTransactions } from '@/components/customer-transactions';
import { AdminListings } from '@/components/admin-listings';
import { TransactionsPage } from '@/components/transactions-page';
import { GeneralShortlist } from '@/components/general-shortlist';
import { DemandList } from '@/components/demand-list';


// ── Provider Dashboard Overview ───────────────────────────────
const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: score + '%' }} />
    </div>
    <span className="text-xs font-bold text-primary w-8">{score}%</span>
  </div>
);

const ProviderOverview = React.memo(function ProviderOverview() {
  const { user } = useAuth();
  const { listings, listingAnalytics, registeredLeads } = useData();

  const myListings = React.useMemo(() =>
    listings.filter(l => l.developerId === user?.email),
    [listings, user]
  );

  const stats = React.useMemo(() => {
    const active = myListings.filter(l => l.status === 'approved');
    const pending = myListings.filter(l => l.status === 'pending');
    const leased = myListings.filter(l => l.status === 'leased');
    const totalSqFt = active.reduce((s, l) => s + l.sizeSqFt, 0);

    const myAnalytics = listingAnalytics.filter(a =>
      myListings.some(l => l.listingId === a.listingId)
    );
    const totalViews = myAnalytics.reduce((s, a) => s + a.views, 0);
    const totalDownloads = myAnalytics.reduce((s, a) => s + a.downloads, 0);

    const myLeads = registeredLeads.filter(l =>
      l.properties?.some((p: any) => myListings.some(ml => ml.listingId === p.listingId))
    );
    const newLeads = myLeads.filter(l => l.status === 'Pending').length;

    // Top listing by views
    const topListing = myAnalytics.sort((a, b) => b.views - a.views)[0];
    const topListingName = topListing
      ? myListings.find(l => l.listingId === topListing.listingId)?.listingId || topListing.listingId
      : null;

    // Listing health scores
    const healthScores = myListings.map(l => {
      let score = 0;
      if (l.name) score += 10;
      if (l.description) score += 15;
      if (l.rentPerSqFt) score += 15;
      if (l.buildingSpecifications?.eveHeightMeters) score += 10;
      if (l.buildingSpecifications?.buildingType?.length) score += 10;
      if (l.buildingSpecifications?.numberOfDocksAndShutters) score += 10;
      if (l.documents && l.documents.length > 0) score += 20;
      if (l.latLng) score += 10;
      return { listingId: l.listingId, location: l.location, score, status: l.status };
    }).sort((a, b) => a.score - b.score);

    return { active: active.length, pending: pending.length, leased: leased.length, totalSqFt, totalViews, totalDownloads, newLeads, topListingName, topViews: topListing?.views || 0, healthScores };
  }, [myListings, listingAnalytics, registeredLeads]);



  return (
    <div className="space-y-6 mb-6">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-foreground">Welcome back, {user?.userName?.split(' ')[0]}! 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">{user?.companyName} · Property Provider Dashboard</p>
        </div>
        {stats.newLeads > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4" />
            {stats.newLeads} new lead{stats.newLeads > 1 ? 's' : ''} waiting
          </div>
        )}
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Active Listings', value: stats.active, icon: Building2, sub: stats.pending > 0 ? stats.pending + ' pending' : 'All approved' },
          { label: 'Total Area', value: (stats.totalSqFt / 1000000).toFixed(1) + 'M', icon: Scaling, sub: 'sq. ft. active' },
          { label: 'Total Views', value: stats.totalViews, icon: Eye, sub: 'All time' },
          { label: 'Total Downloads', value: stats.totalDownloads, icon: Download, sub: 'All time' },
          { label: 'Leased', value: stats.leased, icon: CheckCircle2, sub: 'Completed deals' },
          { label: 'New Leads', value: stats.newLeads, icon: Users, sub: 'Pending response' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <kpi.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium truncate">{kpi.label}</p>
              <p className="text-xl font-black text-foreground leading-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top performer + Listing health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performing listing */}
        {stats.topListingName && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
              <div><h3 className="font-bold text-foreground text-sm">Top Performing Listing</h3><p className="text-xs text-muted-foreground">Most views this period</p></div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="font-black text-foreground text-lg">{stats.topListingName}</p>
              <p className="text-sm text-muted-foreground mt-1">{stats.topViews} total views</p>
              <div className="mt-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listing health scores */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-primary" /></div>
            <div><h3 className="font-bold text-foreground text-sm">Listing Completeness</h3><p className="text-xs text-muted-foreground">Higher score = better visibility</p></div>
          </div>
          {stats.healthScores.length > 0 ? (
            <div className="space-y-3">
              {stats.healthScores.slice(0, 4).map(h => (
                <div key={h.listingId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">{h.listingId}</span>
                    <span className="text-xs text-muted-foreground">{h.location?.split(',')[0]}</span>
                  </div>
                  <ScoreBar score={h.score} />
                </div>
              ))}
              {stats.healthScores.some(h => h.score < 70) && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Some listings need more details for better visibility
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No listings yet</p>
          )}
        </div>
      </div>
    </div>
  );
});

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
      <div>
        <ProviderOverview />
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
      </div>
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
