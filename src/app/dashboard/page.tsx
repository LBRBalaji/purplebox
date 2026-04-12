
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
import { ProspectsTab } from '@/components/prospects-tab';
import { Building2, Eye, Download, TrendingUp, Users, ShieldCheck, CheckCircle2, AlertCircle, Scaling, MessageSquare, FileSignature, LayoutDashboard, ListChecks, UserPlus, ChevronRight, Zap } from 'lucide-react';
import { ProviderLeads } from '@/components/provider-leads';
import { CustomerTransactions } from '@/components/customer-transactions';
import { AdminListings } from '@/components/admin-listings';
import { TransactionsPage } from '@/components/transactions-page';
import { GeneralShortlist } from '@/components/general-shortlist';
import { CompanyAdminDashboard } from '@/components/company-admin-dashboard';
import { DeveloperTeamDashboard } from '@/components/developer-team-dashboard';
import { StaffDashboard } from '@/components/staff-dashboard';
import { DemandList } from '@/components/demand-list';
import { CustomerSubleaseListings } from '@/components/customer-sublease-listings';
import { ListingForm } from '@/components/listing-form';


// ── Provider Dashboard Overview ───────────────────────────────
const ScoreBar = ({ score }: { score: number }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'hsl(259 30% 92%)'}}>
      <div className="h-full rounded-full transition-all" style={{ width: score + '%', background: score >= 80 ? '#22c55e' : score >= 50 ? '#6141ac' : '#f59e0b' }} />
    </div>
    <span className="text-xs font-bold w-8" style={{color: score >= 80 ? '#16a34a' : score >= 50 ? '#6141ac' : '#d97706'}}>{score}%</span>
  </div>
);

const ProviderDashboard = React.memo(function ProviderDashboard({ 
  providerTab, setProviderTab, propertyMatchDemandId, user: userProp 
}: { 
  providerTab: string; setProviderTab: (t: string) => void; propertyMatchDemandId: string | null; user: any 
}) {
  const { listings, listingAnalytics, registeredLeads } = useData();
  const { users } = useAuth();

  const myListings = React.useMemo(() =>
    listings.filter(l => l.developerId === userProp?.email), [listings, userProp]);

  const stats = React.useMemo(() => {
    const active = myListings.filter(l => l.status === 'approved');
    const pending = myListings.filter(l => l.status === 'pending');
    const leased = myListings.filter(l => l.status === 'leased');
    const totalSqFt = active.reduce((s, l) => s + l.sizeSqFt, 0);
    const myAnalytics = listingAnalytics.filter(a => myListings.some(l => l.listingId === a.listingId));
    const totalViews = myAnalytics.reduce((s, a) => s + a.views, 0);
    const totalDownloads = myAnalytics.reduce((s, a) => s + a.downloads, 0);
    const myLeads = registeredLeads.filter(l => l.providers.some(p => p.providerEmail === userProp?.email));
    const newLeads = myLeads.filter(l => !l.providers.find(p => p.providerEmail === userProp?.email)?.properties[0]?.rentPerSft).length;
    const topListing = [...myAnalytics].sort((a, b) => b.views - a.views)[0];
    const healthScores = myListings.map(l => {
      let score = 0;
      if (l.name) score += 15; if (l.rentPerSqFt) score += 15;
      if (l.buildingSpecifications?.eveHeightMeters) score += 10;
      if (l.buildingSpecifications?.buildingType?.length) score += 15;
      if (l.buildingSpecifications?.numberOfDocksAndShutters) score += 15;
      if (l.documents && l.documents.length > 0) score += 20;
      if (l.latLng) score += 10;
      return { listingId: l.listingId, location: l.location, score, status: l.status };
    }).sort((a, b) => a.score - b.score).slice(0, 4);
    return { active: active.length, pending: pending.length, leased: leased.length, totalSqFt, totalViews, totalDownloads, newLeads, topListingId: topListing ? myListings.find(l => l.listingId === topListing.listingId)?.listingId || topListing.listingId : null, topViews: topListing?.views || 0, healthScores, myLeads, myListings: active };
  }, [myListings, listingAnalytics, registeredLeads, userProp]);

  const firstName = userProp?.userName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const tabs = [
    { value: 'my-listings', label: 'My Listings', icon: Building2 },
    { value: 'prospects', label: 'Prospects', icon: Eye },
    { value: 'registered-leads', label: 'Leads & Proposals', icon: FileSignature },
    { value: 'submit-match', label: 'Submit a Match', icon: ListChecks },
    ...(userProp?.isCompanyAdmin ? [{ value: 'my-team', label: 'My Team', icon: Users }] : []),
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Welcome strip */}
      <div className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
        style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
        <div>
          <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{userProp?.companyName} · Property Provider</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {stats.newLeads > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(245,158,11,.18)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.3)'}}>
              {stats.newLeads} lead{stats.newLeads > 1 ? 's' : ''} waiting
            </span>
          )}
          {stats.pending > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.15)'}}>
              {stats.pending} pending approval
            </span>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Listings', value: stats.active, sub: stats.pending > 0 ? `${stats.pending} pending` : 'All approved', accent: false },
          { label: 'Total Area Listed', value: stats.totalSqFt >= 1000000 ? (stats.totalSqFt/1000000).toFixed(1)+'M sq.ft' : stats.totalSqFt.toLocaleString()+' sq.ft', sub: 'Across active listings', accent: false },
          { label: 'Total Views', value: stats.totalViews, sub: 'All time', accent: false },
          { label: 'Leads Awaiting', value: stats.newLeads, sub: 'Need your response', accent: stats.newLeads > 0 },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl p-4" style={{
            background:'#fff',
            border: kpi.accent ? '1px solid #fde68a' : '1px solid hsl(259 30% 91%)',
            borderTop: kpi.accent ? '3px solid #f59e0b' : '3px solid transparent'
          }}>
            <p className="text-2xl font-bold" style={{color:'#1e1537',letterSpacing:'-0.5px'}}>{kpi.value}</p>
            <p className="text-xs font-medium mt-1" style={{color:'#888',textTransform:'uppercase',letterSpacing:'.4px'}}>{kpi.label}</p>
            <p className="text-xs mt-1" style={{color: kpi.accent ? '#d97706' : '#aaa'}}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Listings + Completeness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{color:'#1e1537'}}>My Listings</p>
            <button onClick={() => setProviderTab('my-listings')} className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>
              View all <ChevronRight className="h-3 w-3"/>
            </button>
          </div>
          {stats.myListings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No approved listings yet</p>
              <button onClick={() => setProviderTab('my-listings')} className="mt-3 text-xs font-bold px-4 py-2 rounded-lg text-white" style={{background:'#6141ac'}}>+ Create Listing</button>
            </div>
          ) : (
            <div className="space-y-1">
              {stats.myListings.slice(0, 4).map(l => {
                const analytics = listingAnalytics.find(a => a.listingId === l.listingId);
                return (
                  <div key={l.listingId} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-purple-50"
                    onClick={() => setProviderTab('my-listings')}>
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
                      {l.listingId?.slice(-2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>{l.name || l.listingId}</p>
                      <p className="text-xs" style={{color:'#aaa'}}>{l.sizeSqFt?.toLocaleString()} sq.ft · ₹{l.rentPerSqFt}/sft</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold" style={{color:'#1e1537'}}>{analytics?.views || 0} views</p>
                      <p className="text-xs" style={{color:'#aaa'}}>{analytics?.downloads || 0} dl</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{color:'#1e1537'}}>Listing Completeness</p>
            <ShieldCheck className="h-4 w-4" style={{color:'#6141ac'}}/>
          </div>
          {stats.healthScores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No listings yet</p>
          ) : (
            <div className="space-y-3">
              {stats.healthScores.map(h => (
                <div key={h.listingId}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{color:'#555'}}>{h.listingId}</span>
                    <span className="text-xs" style={{color:'#aaa'}}>{h.location?.split(',')[0]}</span>
                  </div>
                  <ScoreBar score={h.score} />
                </div>
              ))}
              {stats.healthScores.some(h => h.score < 70) && (
                <div className="mt-2 text-xs rounded-lg p-2.5 flex items-center gap-2" style={{background:'#fffbeb',border:'1px solid #fde68a',color:'#d97706'}}>
                  <AlertCircle className="h-3 w-3 flex-shrink-0"/>
                  Some listings need more details for better visibility
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active leads */}
      {stats.myLeads.length > 0 && (
        <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{color:'#1e1537'}}>Active Leads</p>
            <button onClick={() => setProviderTab('registered-leads')} className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>
              View all <ChevronRight className="h-3 w-3"/>
            </button>
          </div>
          <div className="space-y-1">
            {stats.myLeads.slice(0, 4).map(lead => {
              const myProvider = lead.providers.find(p => p.providerEmail === userProp?.email);
              const hasProposal = myProvider?.properties[0]?.rentPerSft !== undefined;
              const customerUser = users?.[lead.customerId];
              const initials = customerUser?.companyName?.slice(0, 2).toUpperCase() || customerUser?.userName?.slice(0, 2).toUpperCase() || 'CU';
              return (
                <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:'hsl(259 30% 98%)'}}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{background:'hsl(259 44% 90%)',color:'#6141ac'}}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>
                      {customerUser?.companyName || lead.customerId}
                    </p>
                    <p className="text-xs" style={{color:'#aaa'}}>
                      {myProvider?.properties[0]?.listingId} · {hasProposal ? 'Proposal submitted' : 'Awaiting proposal'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={hasProposal
                        ? {background:'#f0fdf4',color:'#15803d'}
                        : {background:'#fffbeb',color:'#d97706'}}>
                      {hasProposal ? '● Proposal sent' : '● Needs proposal'}
                    </span>
                    <button onClick={() => window.location.href=`/dashboard/leads/${lead.id}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg text-white flex-shrink-0"
                      style={{background:'#6141ac'}}>
                      {hasProposal ? 'Workspace →' : 'Submit →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 91%)'}}>
        <div className="flex" style={{background:'hsl(259 30% 96%)'}}>
          {tabs.map(tab => (
            <button key={tab.value}
              onClick={() => setProviderTab(tab.value)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
              style={providerTab === tab.value
                ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac'}
                : {background:'transparent',color:'#888',borderBottom:'2px solid transparent'}}>
              <tab.icon className="h-3.5 w-3.5"/>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4">
          {providerTab === 'my-listings' && <ProviderListings />}
          {providerTab === 'prospects' && <ProspectsTab />}
          {providerTab === 'registered-leads' && <ProviderLeads />}
          {providerTab === 'submit-match' && <DemandForm onDemandLogged={() => {}} />}
          {providerTab === 'my-team' && userProp?.isCompanyAdmin && <DeveloperTeamDashboard />}
        </div>
      </div>
    </div>
  );
});

const MainDashboard = () => {
    const { user, users } = useAuth();
    const { submissions } = useData();
    const searchParams = useSearchParams();
    const router = useRouter();
    const defaultTabParam = searchParams.get('tab');
    const logNewDemand = searchParams.get('logNew') === 'true';
    const editDemandId = searchParams.get('editDemandId');
    const propertyMatchDemandId = searchParams.get('demandId');
    const isSuperAdmin = user?.role === 'SuperAdmin';
    const isO2OManager = user?.role === 'O2O';
    const isProvider = user?.role === 'Warehouse Developer';
    const isCustomer = user?.role === 'User';
    const isAgent = user?.role === 'Agent';
    const isInternalStaff = (user as any)?.isInternalStaff === true;
    const [providerTab, setProviderTab] = React.useState(defaultTabParam || 'registered-leads');
    const [customerTab, setCustomerTab] = React.useState(defaultTabParam || 'my-transactions');
    const [adminTab, setAdminTab] = React.useState(defaultTabParam || 'approval-queue');
    const [agentTab, setAgentTab] = React.useState(defaultTabParam || 'transactions');
    const hasPendingSubmissions = React.useMemo(() => submissions.some(s => s.status === 'Pending'), [submissions]);
    const handleSwitchToMyDemands = React.useCallback(() => setCustomerTab('my-demands'), []);
    React.useEffect(() => {
      if (logNewDemand || editDemandId) { setCustomerTab('log-demand'); }
      else if (propertyMatchDemandId) { setProviderTab('submit-match'); setAdminTab('submit-match'); }
      else if (defaultTabParam) {
        if (isProvider) setProviderTab(defaultTabParam);
        if (isCustomer) setCustomerTab(defaultTabParam === 'my-sublease' ? 'my-sublease' : defaultTabParam);
        if (isO2OManager) setAdminTab(defaultTabParam);
        if (isAgent) setAgentTab(defaultTabParam);
      } else {
        if (isProvider) setProviderTab('registered-leads');
        if (isCustomer) setCustomerTab('my-transactions');
      }
    }, [logNewDemand, editDemandId, propertyMatchDemandId, defaultTabParam, isProvider, isCustomer, isO2OManager, isAgent]);

    const renderCustomerContent = () => (
      <Tabs value={customerTab} onValueChange={setCustomerTab}>
        <TabsList className={`grid w-full ${user?.isCompanyAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="my-demands">My Demands & Matches</TabsTrigger>
          <TabsTrigger value="log-demand">Log New Demand</TabsTrigger>
          <TabsTrigger value="my-shortlist">My Shortlist</TabsTrigger>
          <TabsTrigger value="my-transactions">My Transactions</TabsTrigger>
          <TabsTrigger value="my-sublease">My Sublease Listings</TabsTrigger>
          {user?.isCompanyAdmin && <TabsTrigger value="my-team">My Team</TabsTrigger>}
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
        <TabsContent value="my-sublease">
          <CustomerSubleaseListings />
        </TabsContent>
        {user?.isCompanyAdmin && (
          <TabsContent value="my-team">
            <CompanyAdminDashboard />
          </TabsContent>
        )}
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
    
    const staffPrivileges: string[] = (user as any)?.privileges || [];
    const hasPrivilege = (p: string) => staffPrivileges.includes(p);
    const [staffListingOpen, setStaffListingOpen] = React.useState(false);
    const { addListing, locationCircles: staffLocationCircles } = useData();

    if (isInternalStaff) {
        const activeTab = defaultTabParam || 'home';
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-foreground">Staff Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.userName}. Here are your assigned modules.</p>
              </div>
              {hasPrivilege('create_listings') && (
                <button onClick={() => setStaffListingOpen(true)}
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                  + Create New Listing
                </button>
              )}
            </div>
            <StaffDashboard />
            {hasPrivilege('create_listings') && (
              <ListingForm
                isOpen={staffListingOpen}
                onOpenChange={setStaffListingOpen}
                listing={null}
                onSubmit={(data) => {
                  addListing(data, user?.email);
                  setStaffListingOpen(false);
                }}
                locationCircles={staffLocationCircles || []}
              />
            )}
          </div>
        );
    } else if (isSuperAdmin) {
        return renderMainAdminContent();
    } else if (isO2OManager) {
        return renderO2OContent();
    } else if (isAgent) {
        return renderAgentContent();
    } else if (isProvider) {
        return (
          <ProviderDashboard
            providerTab={providerTab}
            setProviderTab={setProviderTab}
            propertyMatchDemandId={propertyMatchDemandId}
            user={user}
          />
        );
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
