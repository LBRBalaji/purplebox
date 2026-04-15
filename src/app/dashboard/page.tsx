
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
import { Building2, Eye, Download, TrendingUp, Users, ShieldCheck, CheckCircle2, AlertCircle, Scaling, MessageSquare, FileSignature, LayoutDashboard, ListChecks, UserPlus, ChevronRight, Zap, FileText } from 'lucide-react';
import Link from 'next/link';
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
  const { listings, listingAnalytics, registeredLeads, transactionActivities, unreadChatCount } = useData();
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
    // Leads where customer requested a quote but developer hasn't submitted proposal yet
    const urgentLeads = myLeads.filter(l => {
      const leadActs = transactionActivities.filter((a: any) => a.leadId === l.id);
      const hasQuoteReq = leadActs.some((a: any) => a.activityType === 'Quote Requested');
      const hasProposalSub = leadActs.some((a: any) => a.activityType === 'Proposal Submitted');
      return hasQuoteReq && !hasProposalSub;
    });
    const urgentCount = urgentLeads.length;
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
    return { active: active.length, pending: pending.length, leased: leased.length, totalSqFt, totalViews, totalDownloads, newLeads, urgentCount, urgentLeads, topListingId: topListing ? myListings.find(l => l.listingId === topListing.listingId)?.listingId || topListing.listingId : null, topViews: topListing?.views || 0, healthScores, myLeads, myListings: active };
  }, [myListings, listingAnalytics, registeredLeads, userProp]);

  const firstName = userProp?.userName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Sub-role access control for multi-city (official email) developers
  const approvedSubRoles: string[] = (userProp as any)?.approvedSubRoles || [];
  const subRoleDeactivated = !!(userProp as any)?.subRoleDeactivated;
  const isPersonalEmailDev = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','live.com','msn.com','protonmail.com'].includes(userProp?.email?.split('@')[1]?.toLowerCase() || '');
  // Standalone devs (personal email) or those with no approved sub-roles have full access
  const hasSubRoles = approvedSubRoles.length > 0 && !subRoleDeactivated && !isPersonalEmailDev;
  const canManageInventory = !hasSubRoles || approvedSubRoles.includes('Inventory In-Charge');
  const canManageTransactions = !hasSubRoles || approvedSubRoles.includes('Transaction In-Charge');

  const tabs = [
    { value: 'my-listings', label: 'My Listings', icon: Building2 },
    { value: 'prospects', label: 'Prospects', icon: Eye },
    { value: 'registered-leads', label: 'Leads & Proposals', icon: FileSignature },
    { value: 'submit-match', label: 'Demand Board', icon: ListChecks },
    ...(userProp?.isCompanyAdmin ? [{ value: 'my-team', label: 'My Team', icon: Users }] : []),
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Welcome strip */}
      <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
        style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
        <div>
          <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{userProp?.companyName} · Property Provider</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {stats.urgentCount > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(239,68,68,.2)',color:'#f87171',border:'1px solid rgba(239,68,68,.3)'}}>
              {stats.urgentCount} quote{stats.urgentCount > 1 ? 's' : ''} awaiting
            </span>
          )}
          {stats.pending > 0 && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.15)'}}>
              {stats.pending} pending approval
            </span>
          )}
          <Link href="/register-deal" title="Bring an off-platform deal into ORS-ONE. Already in talks with a customer or developer outside this platform? Register the deal here to use the Commercial Term Sheet, Fit-Out tools and MoU drafting. Starts directly at Term Sheet — no Chat or Quote stages." className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 transition-all hover:opacity-90" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
            <FileText className="h-4 w-4" /> Register a Deal
          </Link>
        </div>
      </div>

      {/* Urgent response alert — shown when developer has leads awaiting quote response */}
      {(stats.urgentCount > 0 || unreadChatCount > 0) && (
        <div className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
          style={{background:'linear-gradient(135deg,#2d1f52,#1e1537)',border:'1px solid hsl(259 44% 30%)'}}>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)'}}>
              <svg width="14" height="14" fill="none" stroke="#f87171" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{color:'#fff'}}>Action Required</p>
              <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,.6)'}}>
                {stats.urgentCount > 0 && <span>{stats.urgentCount} lead{stats.urgentCount > 1 ? 's' : ''} waiting for your commercial quote{unreadChatCount > 0 ? ' · ' : ''}</span>}
                {unreadChatCount > 0 && <span>{unreadChatCount} unread chat message{unreadChatCount > 1 ? 's' : ''}</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {stats.urgentCount > 0 && (
              <button onClick={() => setProviderTab('registered-leads')}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                style={{background:'#6141ac',color:'#fff'}}>
                Respond to Quotes →
              </button>
            )}
            {unreadChatCount > 0 && (
              <button onClick={() => setProviderTab('registered-leads')}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                style={{background:'transparent',color:'#c5b8e8',border:'1px solid rgba(255,255,255,.2)'}}>
                Open Chats →
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Listings', value: stats.active, sub: stats.pending > 0 ? `${stats.pending} pending` : 'All approved', accent: false },
          { label: 'Total Area Listed', value: stats.totalSqFt >= 1000000 ? (stats.totalSqFt/1000000).toFixed(1)+'M sq.ft' : stats.totalSqFt.toLocaleString()+' sq.ft', sub: 'Across active listings', accent: false },
          { label: 'Total Views', value: stats.totalViews, sub: 'All time', accent: false },
          { label: 'Quote Requests', value: stats.urgentCount, sub: stats.urgentCount > 0 ? 'Awaiting your response' : 'All responded', accent: stats.urgentCount > 0 },
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
              const leadActs = transactionActivities.filter((a: any) => a.leadId === lead.id);
              const quoteRequested = leadActs.some((a: any) => a.activityType === 'Quote Requested');
              const isUrgent = quoteRequested && !hasProposal;
              return (
                <div key={lead.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:opacity-90"
                  style={{background: isUrgent ? 'hsl(259 44% 96%)' : 'hsl(259 30% 98%)', border: isUrgent ? '1px solid hsl(259 44% 82%)' : '1px solid transparent'}}
                  onClick={() => window.location.href=`/dashboard/leads/${lead.id}?tab=activity`}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{background: isUrgent ? '#6141ac' : 'hsl(259 44% 90%)', color: isUrgent ? '#fff' : '#6141ac'}}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>
                      {customerUser?.companyName || lead.customerId}
                    </p>
                    <p className="text-xs" style={{color: isUrgent ? '#6141ac' : '#aaa'}}>
                      {myProvider?.properties[0]?.listingId} · {isUrgent ? 'Quote requested — respond now' : hasProposal ? 'Proposal submitted' : 'Awaiting quote request'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUrgent ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#6141ac',color:'#fff'}}>
                        ● Respond
                      </span>
                    ) : hasProposal ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#f0fdf4',color:'#15803d'}}>
                        ● Done
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'hsl(259 30% 92%)',color:'#888'}}>
                        ● Waiting
                      </span>
                    )}
                    <svg width="14" height="14" fill="none" stroke="#6141ac" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
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
          {tabs.map(tab => {
            const isLeadsTab = tab.value === 'registered-leads';
            const badgeCount = isLeadsTab ? (stats.urgentCount + unreadChatCount) : 0;
            return (
            <button key={tab.value}
              onClick={() => setProviderTab(tab.value)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all relative"
              style={providerTab === tab.value
                ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac'}
                : {background:'transparent',color:'#888',borderBottom:'2px solid transparent'}}>
              <tab.icon className="h-3.5 w-3.5"/>
              <span className="hidden sm:inline">{tab.label}</span>
              {badgeCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full text-white flex items-center justify-center"
                  style={{background:'#ef4444',fontSize:'9px',fontWeight:700,lineHeight:1}}>
                  {badgeCount}
                </span>
              )}
            </button>
            );
          })}
        </div>
        <div className="p-4">
          {providerTab === 'my-listings' && (
            canManageInventory ? <ProviderListings /> :
            <div className="p-8 text-center rounded-none" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
              <p className="text-sm font-bold" style={{color:'#1e1537'}}>Access Restricted</p>
              <p className="text-xs mt-1" style={{color:'hsl(259 15% 55%)'}}>Your role is Transaction In-Charge. Inventory management is handled by your Inventory In-Charge team member. Contact your Company Admin to update your role.</p>
            </div>
          )}
          {providerTab === 'prospects' && <ProspectsTab />}
          {providerTab === 'registered-leads' && (
            canManageTransactions ? <ProviderLeads /> :
            <div className="p-8 text-center rounded-none" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
              <p className="text-sm font-bold" style={{color:'#1e1537'}}>Access Restricted</p>
              <p className="text-xs mt-1" style={{color:'hsl(259 15% 55%)'}}>Your role is Inventory In-Charge. Lead and transaction management is handled by your Transaction In-Charge team member. Contact your Company Admin to update your role.</p>
            </div>
          )}
          {providerTab === 'submit-match' && (
            canManageTransactions ? <DemandList /> :
            <div className="p-8 text-center rounded-none" style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)'}}>
              <p className="text-sm font-bold" style={{color:'#1e1537'}}>Access Restricted</p>
              <p className="text-xs mt-1" style={{color:'hsl(259 15% 55%)'}}>Demand Board is accessible to Transaction In-Charge only. Contact your Company Admin to update your role.</p>
            </div>
          )}
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
          <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
            style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
            <div>
              <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
              <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.companyName} · Customer · {(user as any)?.industryType || 'Warehouse Tenant'}</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
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
              <Link href="/register-deal" title="Bring an off-platform deal into ORS-ONE. If you are already in talks with a customer or developer outside this platform, register the deal here to use the Commercial Term Sheet, Fit-Out tools and MoU drafting. Starts directly at Term Sheet — no Chat or Quote stages." className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 transition-all hover:opacity-90" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
                <FileText className="h-4 w-4" /> Register a Deal
              </Link>
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
                            <span className="text-xs" style={{color:'#aaa'}}>{provider.properties[0].rentPerSft ? `₹${provider.properties[0].rentPerSft}/sft` : 'RFQ'}</span>
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

    const renderAgentContent = () => {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const firstName = user?.userName?.split(' ')[0] || 'there';
      return (
        <div className="space-y-4">
          {/* Agent welcome strip */}
          <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
            style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
            <div>
              <h2 className="text-xl font-bold text-white">{greeting}, {firstName} 👋</h2>
              <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.companyName} · Transaction Agent</p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Link href="/register-deal" title="Bring an off-platform deal into ORS-ONE. If you are already in talks with a customer or developer outside this platform, register the deal here to use the Commercial Term Sheet, Fit-Out tools and MoU drafting. Starts directly at Term Sheet — no Chat or Quote stages." className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 transition-all hover:opacity-90" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
                <FileText className="h-4 w-4" /> Register a Deal
              </Link>
            </div>
          </div>
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
        </div>
      );
    };

    const renderMainAdminContent = () => {
      const allUsers = Object.values(users || {}) as any[];
      const pendingUsers = allUsers.filter(u => u.status === 'pending');
      const approvedUsers = allUsers.filter(u => u.status === 'approved');
      const developers = approvedUsers.filter(u => u.role === 'Warehouse Developer');
      const customers = approvedUsers.filter(u => u.role === 'User');

      const approvedListings = listings.filter(l => l.status === 'approved');
      const pendingListings = listings.filter(l => l.status === 'pending');

      const allLeads = registeredLeads;
      const leadsWithProposal = allLeads.filter(l => l.providers?.some((p: any) => p.properties?.[0]?.rentPerSft !== undefined));
      const pendingApprovals = [...pendingListings.map(l => ({ type: 'listing' as const, id: l.listingId, name: l.name || l.listingId, sub: `${l.location?.split(',')[0]} · ${l.sizeSqFt?.toLocaleString()} sft`, badge: l.listingType === 'Sublease' ? 'Sublease' : 'Listing' })),
        ...pendingUsers.map(u => ({ type: 'user' as const, id: u.email, name: u.companyName || u.userName, sub: `${u.role === 'Warehouse Developer' ? 'Developer' : u.role === 'User' ? 'Customer' : u.role} · ${u.email}`, badge: u.role === 'Warehouse Developer' ? 'Developer' : 'Customer' }))
      ].slice(0, 6);

      const pipeline = [
        { label: 'Chat', count: allLeads.length, color: '#3b82f6' },
        { label: 'Proposal', count: leadsWithProposal.length, color: '#6141ac' },
        { label: 'Negotiation', count: Math.floor(leadsWithProposal.length * 0.6), color: '#6141ac' },
        { label: 'Fit-Out', count: Math.floor(leadsWithProposal.length * 0.3), color: '#8b5cf6' },
        { label: 'MoU', count: Math.floor(leadsWithProposal.length * 0.1), color: '#22c55e' },
      ];
      const maxPipe = Math.max(...pipeline.map(p => p.count), 1);

      const adminTabs = [
        { value: 'all-listings', label: 'All Listings', icon: Building2 },
        { value: 'all-demands', label: 'All Demands', icon: ListChecks },
      ];

      return (
        <div className="space-y-4 mb-6">
          {/* Welcome strip */}
          <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
            style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
            <div>
              <h2 className="text-xl font-bold text-white">ORS-ONE Admin Console</h2>
              <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>Balaji Pillai · SuperAdmin · Building Transaction Ready Assets</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {pendingApprovals.length > 0 && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(245,158,11,.18)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.3)'}}>
                  {pendingApprovals.length} pending approval{pendingApprovals.length > 1 ? 's' : ''}
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.15)'}}>
                {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
              </span>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Listings', value: approvedListings.length, sub: pendingListings.length > 0 ? `${pendingListings.length} pending review` : 'All approved', alert: pendingListings.length > 0 },
              { label: 'Registered Users', value: approvedUsers.length, sub: pendingUsers.length > 0 ? `${pendingUsers.length} pending approval` : `${developers.length} dev · ${customers.length} cust`, alert: pendingUsers.length > 0 },
              { label: 'Active Deals', value: allLeads.length, sub: `${leadsWithProposal.length} with proposal`, good: allLeads.length > 0 },
              { label: 'Total Sq.Ft Listed', value: approvedListings.reduce((s: number, l: any) => s + (l.sizeSqFt || 0), 0) >= 1000000 ? (approvedListings.reduce((s: number, l: any) => s + (l.sizeSqFt || 0), 0) / 1000000).toFixed(1) + 'M' : approvedListings.reduce((s: number, l: any) => s + (l.sizeSqFt || 0), 0).toLocaleString(), sub: 'Across active listings', good: false },
            ].map((kpi, i) => (
              <div key={i} className="rounded-2xl p-4" style={{
                background:'#fff',
                border: kpi.alert ? '1px solid #fde68a' : '1px solid hsl(259 30% 91%)',
                borderTop: kpi.alert ? '3px solid #f59e0b' : (kpi as any).good ? '3px solid #22c55e' : '3px solid transparent',
              }}>
                <p className="text-2xl font-bold" style={{color:'#1e1537',letterSpacing:'-0.5px'}}>{kpi.value}</p>
                <p className="text-xs font-medium mt-1" style={{color:'#888',textTransform:'uppercase',letterSpacing:'.4px'}}>{kpi.label}</p>
                <p className="text-xs mt-1" style={{color: kpi.alert ? '#d97706' : '#aaa'}}>{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Approval queue + Deal pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Approval queue */}
            <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{color:'#1e1537'}}>
                  Approval Queue
                  {pendingApprovals.length > 0 && (
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#fef9c3',color:'#92400e'}}>{pendingApprovals.length}</span>
                  )}
                </p>
                <a href="/dashboard/manage-users" className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>
                  Manage Users <ChevronRight className="h-3 w-3"/>
                </a>
              </div>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{color:'#22c55e'}}/>
                  <p className="text-sm font-semibold" style={{color:'#1e1537'}}>All clear</p>
                  <p className="text-xs" style={{color:'#aaa'}}>No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {pendingApprovals.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:'hsl(259 30% 98%)'}}>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{background:'hsl(259 44% 90%)',color:'#6141ac'}}>
                        {(item.name || '').slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>{item.name}</p>
                        <p className="text-xs truncate" style={{color:'#aaa'}}>{item.sub}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={
                        item.badge === 'Listing' ? {background:'#f0edfb',color:'#6141ac'} :
                        item.badge === 'Sublease' ? {background:'#fef9c3',color:'#92400e'} :
                        item.badge === 'Developer' ? {background:'#eff6ff',color:'#1d4ed8'} :
                        {background:'#f0fdf4',color:'#15803d'}
                      }>{item.badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deal pipeline */}
            <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{color:'#1e1537'}}>Deal Pipeline</p>
                <TrendingUp className="h-4 w-4" style={{color:'#6141ac'}}/>
              </div>
              <div className="space-y-3">
                {pipeline.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20 flex-shrink-0" style={{color:'#888'}}>{p.label}</span>
                    <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{background:'hsl(259 30% 96%)'}}>
                      <div className="h-full rounded-lg flex items-center px-2 transition-all" style={{width: `${Math.max((p.count / maxPipe) * 100, p.count > 0 ? 12 : 0)}%`, background: p.color}}>
                        {p.count > 0 && <span className="text-xs font-bold text-white">{p.count}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold w-4 text-right flex-shrink-0" style={{color:'#1e1537'}}>{p.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 grid grid-cols-3 gap-2" style={{borderTop:'1px solid hsl(259 30% 91%)'}}>
                {[
                  { label: 'Developers', value: developers.length, color: '#eff6ff', text: '#1d4ed8' },
                  { label: 'Customers', value: customers.length, color: '#f0fdf4', text: '#15803d' },
                  { label: 'Active Leads', value: allLeads.length, color: '#f0edfb', text: '#6141ac' },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{background: stat.color}}>
                    <p className="text-base font-bold" style={{color: stat.text}}>{stat.value}</p>
                    <p className="text-xs mt-0.5" style={{color:'#aaa'}}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Manage Users', sub: `${pendingUsers.length} pending`, href: '/dashboard/manage-users', alert: pendingUsers.length > 0 },
              { label: 'All Listings', sub: `${approvedListings.length} active`, href: '#listings', alert: false },
              { label: 'All Demands', sub: `${allLeads.length} active`, href: '#demands', alert: false },
              { label: 'Analytics', sub: 'Views & downloads', href: '/dashboard/analytics', alert: false },
            ].map((nav, i) => (
              <a key={i} href={nav.href}
                className="rounded-2xl p-4 flex flex-col gap-1 cursor-pointer transition-all hover:shadow-sm"
                style={{background:'#fff', border: nav.alert ? '1px solid #fde68a' : '1px solid hsl(259 30% 91%)'}}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{color:'#1e1537'}}>{nav.label}</p>
                  <ChevronRight className="h-4 w-4" style={{color:'#aaa'}}/>
                </div>
                <p className="text-xs" style={{color: nav.alert ? '#d97706' : '#aaa'}}>{nav.sub}</p>
              </a>
            ))}
          </div>

          {/* Tabs for listings/demands */}
          <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 91%)'}}>
            <div id="listings" className="flex" style={{background:'hsl(259 30% 96%)'}}>
              {adminTabs.map(tab => (
                <button key={tab.value}
                  onClick={() => setAdminTab(tab.value)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-all"
                  style={adminTab === tab.value
                    ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac'}
                    : {background:'transparent',color:'#888',borderBottom:'2px solid transparent'}}>
                  <tab.icon className="h-3.5 w-3.5"/>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {adminTab === 'all-listings' && <AdminListings />}
              {adminTab === 'all-demands' && <DemandList />}
            </div>
          </div>
        </div>
      );
    };
    
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
