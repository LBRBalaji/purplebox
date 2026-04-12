
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
    const { submissions, downloadHistory, registeredLeads, unreadChatCount, generalShortlist, listings } = useData();
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

    const renderCustomerContent = () => {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const firstName = user?.userName?.split(' ')[0] || 'there';

      // Compute customer stats inline
      const myDownloads = downloadHistory.filter((d: any) => d.userId === user?.email);
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const downloadsToday = myDownloads.filter((d: any) => d.timestamp >= todayStart.getTime()).length;
      const downloadLimit = 5;
      const myLeads = registeredLeads.filter((l: any) => l.customerId === user?.email);
      const activeTransaction = myLeads.find((l: any) => {
        const p = l.providers?.[0];
        return p?.properties?.[0]?.rentPerSft !== undefined;
      });
      const hasProposalReady = myLeads.some((l: any) => {
        const p = l.providers?.[0];
        return p?.properties?.[0]?.rentPerSft !== undefined;
      });
      const shortlistCount = generalShortlist?.length || 0;

      const tabs = [
        { value: 'my-demands', label: 'My Demands & Matches', icon: ListChecks },
        { value: 'log-demand', label: 'Log New Demand', icon: Zap },
        { value: 'my-shortlist', label: 'My Shortlist', icon: Building2 },
        { value: 'my-transactions', label: 'My Transactions', icon: FileSignature },
        { value: 'my-sublease', label: 'My Sublease Listings', icon: Scaling },
        ...(user?.isCompanyAdmin ? [{ value: 'my-team', label: 'My Team', icon: Users }] : []),
      ];

      return (
        <div className="space-y-4 mb-6">
          {/* Welcome strip */}
          <div className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
            style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
            <div>
              <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
              <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.companyName} · Customer · {(user as any)?.industryType || 'Warehouse Tenant'}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {hasProposalReady && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(245,158,11,.18)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.3)'}}>
                  Proposal ready to review
                </span>
              )}
              {myLeads.length > 0 && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(34,197,94,.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,.25)'}}>
                  {myLeads.length} active deal{myLeads.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Downloads Today', value: downloadsToday, sub: downloadsToday >= downloadLimit ? 'Limit reached' : `${downloadLimit - downloadsToday} remaining`, alert: downloadsToday >= downloadLimit },
              { label: 'Shortlisted', value: shortlistCount, sub: 'Saved for review', alert: false },
              { label: 'Active Transactions', value: myLeads.length, sub: myLeads.length > 0 ? 'In progress' : 'None yet', good: myLeads.length > 0 },
              { label: 'Open Chats', value: unreadChatCount > 0 ? `${unreadChatCount}` : '—', sub: unreadChatCount > 0 ? `${unreadChatCount} unread` : 'All caught up', alert: unreadChatCount > 0 },
            ].map((kpi, i) => (
              <div key={i} className="rounded-2xl p-4" style={{
                background:'#fff',
                border: kpi.alert ? '1px solid #fde68a' : '1px solid hsl(259 30% 91%)',
                borderTop: kpi.alert ? '3px solid #f59e0b' : (kpi as any).good ? '3px solid #22c55e' : '3px solid transparent'
              }}>
                <p className="text-2xl font-bold" style={{color:'#1e1537',letterSpacing:'-0.5px'}}>{kpi.value}</p>
                <p className="text-xs font-medium mt-1" style={{color:'#888',textTransform:'uppercase',letterSpacing:'.4px'}}>{kpi.label}</p>
                <p className="text-xs mt-1" style={{color: kpi.alert ? '#d97706' : '#aaa'}}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Next step card — shown only when there's a proposal to action */}
          {hasProposalReady && (
            <div className="rounded-2xl p-4 flex items-center gap-3 flex-wrap"
              style={{background:'#1e1537',border:'1px solid hsl(259 25% 22%)'}}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'#6141ac'}}>
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider" style={{color:'rgba(197,184,232,.7)'}}>Your next step</p>
                <p className="text-sm mt-0.5" style={{color:'#c5b8e8'}}>
                  Developer has submitted a commercial proposal. Review it and open the Negotiation Board to discuss terms.
                </p>
              </div>
              <button
                onClick={() => { if (activeTransaction) window.location.href = `/dashboard/leads/${activeTransaction.id}?tab=negotiation-board`; else setCustomerTab('my-transactions'); }}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{background:'#6141ac'}}>
                Review & Negotiate →
              </button>
            </div>
          )}

          {/* Active transaction + shortlist */}
          {myLeads.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold" style={{color:'#1e1537'}}>Active Transactions</p>
                  <button onClick={() => setCustomerTab('my-transactions')} className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>
                    View all <ChevronRight className="h-3 w-3"/>
                  </button>
                </div>
                <div className="space-y-3">
                  {myLeads.slice(0,3).map((lead: any) => {
                    const provider = lead.providers?.[0];
                    const listing = listings.find((l: any) => l.listingId === provider?.properties?.[0]?.listingId);
                    const hasProposal = provider?.properties?.[0]?.rentPerSft !== undefined;
                    const journeyStage = hasProposal ? 2 : 1;
                    const stages = ['Chat','Proposal','Negotiate','Fit-Out','MoU'];
                    return (
                      <div key={lead.id}
                        className="rounded-xl p-3 cursor-pointer transition-colors hover:bg-purple-50"
                        style={{background:'hsl(259 30% 98%)',border:'1px solid hsl(259 30% 91%)'}}
                        onClick={() => window.location.href=`/dashboard/leads/${lead.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold" style={{color:'#1e1537'}}>
                            {listing?.name || listing?.listingId || provider?.properties?.[0]?.listingId}
                          </p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background: hasProposal ? '#fef9c3' : '#f0edfb', color: hasProposal ? '#92400e' : '#6141ac'}}>
                            {stages[journeyStage]}
                          </span>
                        </div>
                        {/* Mini journey bar */}
                        <div className="flex items-center gap-0">
                          {stages.map((s, i) => (
                            <React.Fragment key={s}>
                              <div className="flex flex-col items-center gap-0.5" style={{flexShrink:0}}>
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={
                                  i < journeyStage ? {background:'#6141ac',color:'#fff',fontSize:'9px'} :
                                  i === journeyStage ? {background:'hsl(259 44% 94%)',color:'#6141ac',border:'1.5px solid #6141ac',fontSize:'9px'} :
                                  {background:'hsl(259 30% 92%)',color:'#bbb',fontSize:'9px'}
                                }>{i < journeyStage ? '✓' : i+1}</div>
                                <span className="text-xs" style={{fontSize:'9px',color: i <= journeyStage ? '#6141ac' : '#ccc'}}>{s}</span>
                              </div>
                              {i < stages.length-1 && <div style={{flex:1,height:'2px',background: i < journeyStage ? '#6141ac' : 'hsl(259 30% 88%)',marginBottom:'14px'}}/>}
                            </React.Fragment>
                          ))}
                        </div>
                        {hasProposal && (
                          <div className="mt-2 pt-2 flex gap-4" style={{borderTop:'1px solid hsl(259 30% 91%)'}}>
                            <span className="text-xs" style={{color:'#aaa'}}>₹{provider.properties[0].rentPerSft}/sft</span>
                            <span className="text-xs" style={{color:'#aaa'}}>{provider.properties[0].actualChargeableArea?.toLocaleString()} sft</span>
                            <span className="text-xs font-semibold" style={{color:'#6141ac'}}>Open Workspace →</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold" style={{color:'#1e1537'}}>Shortlist</p>
                  <button onClick={() => setCustomerTab('my-shortlist')} className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>
                    View all <ChevronRight className="h-3 w-3"/>
                  </button>
                </div>
                {shortlistCount === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No listings shortlisted yet</p>
                    <button onClick={() => window.location.href='/listings'} className="mt-3 text-xs font-bold px-4 py-2 rounded-lg text-white" style={{background:'#6141ac'}}>Browse Listings</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {(generalShortlist || []).slice(0,4).map((listingId: string) => {
                      const l = listings.find((x: any) => x.listingId === listingId);
                      return (
                        <div key={listingId} className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-purple-50"
                          onClick={() => window.location.href=`/listings/${listingId}`}>
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'hsl(259 44% 94%)',color:'#6141ac'}}>
                            {listingId.slice(-2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{color:'#1e1537'}}>{l?.name || listingId}</p>
                            <p className="text-xs" style={{color:'#aaa'}}>{l?.location?.split(',')[0]} · {l?.sizeSqFt?.toLocaleString()} sft</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 91%)'}}>
            <div className="flex overflow-x-auto" style={{background:'hsl(259 30% 96%)'}}>
              {tabs.map(tab => (
                <button key={tab.value}
                  onClick={() => setCustomerTab(tab.value)}
                  className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
                  style={customerTab === tab.value
                    ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac',flex:'1 1 auto'}
                    : {background:'transparent',color:'#888',borderBottom:'2px solid transparent',flex:'1 1 auto'}}>
                  <tab.icon className="h-3.5 w-3.5"/>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-4">
              {customerTab === 'my-demands' && <MyDemands onSwitchTab={setCustomerTab} />}
              {customerTab === 'log-demand' && <DemandForm onDemandLogged={handleSwitchToMyDemands} />}
              {customerTab === 'my-shortlist' && <GeneralShortlist />}
              {customerTab === 'my-transactions' && <CustomerTransactions />}
              {customerTab === 'my-sublease' && <CustomerSubleaseListings />}
              {customerTab === 'my-team' && user?.isCompanyAdmin && <CompanyAdminDashboard />}
            </div>
          </div>
        </div>
      );
    };
    
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
