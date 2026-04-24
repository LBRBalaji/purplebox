'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ListChecks, FileText, Upload, Users, Zap, Plus, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { DemandForm } from '@/components/demand-form';
import { DemandList } from '@/components/demand-list';
import { AdminListings } from '@/components/admin-listings';
import { ApprovalQueue } from '@/components/approval-queue';
import { OrsTransactImport } from '@/components/ors-transact-import';
import { OrsTransactRoleManager } from '@/components/ors-transact-role-manager';
import { OrsTransactAdminForm } from '@/components/ors-transact-admin-form';
import { OrsTransactManager } from '@/components/ors-transact-manager';
import { EngagementJobsPanel } from '@/components/engagement-jobs-panel';
import { GeneralShortlist } from '@/components/general-shortlist';
import { ProviderLeads } from '@/components/provider-leads';

export default function AdminDashboard() {
  const { user, users } = useAuth();
  const { listings, demands, registeredLeads, submissions } = useData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'approval-queue';
  const editDemandId = searchParams.get('editDemandId');

  const [tab, setTab] = React.useState(editDemandId ? 'create-demand' : defaultTab);

  React.useEffect(() => {
    if (editDemandId) setTab('create-demand');
    else if (defaultTab) setTab(defaultTab);
  }, [editDemandId, defaultTab]);

  const allUsers = Object.values(users || {}) as any[];
  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const approvedUsers = allUsers.filter(u => u.status === 'approved');
  const developers = approvedUsers.filter(u => u.role === 'Warehouse Developer');
  const customers = approvedUsers.filter(u => u.role === 'User');
  const approvedListings = listings.filter(l => l.status === 'approved');
  const pendingListings = listings.filter(l => l.status === 'pending');
  const hasPendingSubmissions = submissions.some(s => s.status === 'Pending');
  const leadsWithProposal = registeredLeads.filter(l => l.providers?.some((p: any) => p.properties?.[0]?.rentPerSft !== undefined));

  const pendingApprovals = [
    ...pendingListings.map(l => ({ type: 'listing', id: l.listingId, name: l.name || l.listingId, sub: `${l.location?.split(',')[0]} · ${l.sizeSqFt?.toLocaleString()} sft`, badge: l.listingType === 'Sublease' ? 'Sublease' : 'Listing' })),
    ...pendingUsers.map(u => ({ type: 'user', id: u.email, name: u.companyName || u.userName, sub: `${u.role} · ${u.email}`, badge: u.role === 'Warehouse Developer' ? 'Developer' : 'Customer' })),
  ].slice(0, 6);

  const pipeline = [
    { label: 'Chat', count: registeredLeads.length, color: '#3b82f6' },
    { label: 'Proposal', count: leadsWithProposal.length, color: '#6141ac' },
    { label: 'Negotiation', count: Math.floor(leadsWithProposal.length * 0.6), color: '#6141ac' },
    { label: 'Fit-Out', count: Math.floor(leadsWithProposal.length * 0.3), color: '#8b5cf6' },
    { label: 'MoU', count: Math.floor(leadsWithProposal.length * 0.1), color: '#22c55e' },
  ];
  const maxPipe = Math.max(...pipeline.map(p => p.count), 1);

  const tabs = [
    { value: 'approval-queue', label: 'Approval Queue', icon: CheckCircle2 },
    { value: 'all-listings', label: 'All Listings', icon: Building2 },
    { value: 'all-demands', label: 'All Demands', icon: ListChecks },
    { value: 'create-demand', label: 'Create Demand', icon: FileText },
    { value: 'all-leads', label: 'All Leads', icon: Users },
    { value: 'my-shortlist', label: 'Shortlist', icon: Building2 },
    { value: 'ors-transact-manage', label: 'Manage ORS Listings', icon: Building2 },
    { value: 'ors-transact-new', label: 'New ORS Listing', icon: Plus },
    { value: 'ors-transact-import', label: 'ORS Transact Import', icon: Upload },
    { value: 'ors-transact-roles', label: 'ORS Transact Roles', icon: Users },
    { value: 'engagement-jobs', label: 'Engagement Jobs', icon: Zap },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Welcome strip */}
      <div className="rounded-none p-6 flex items-center justify-between flex-wrap gap-4"
        style={{background:'linear-gradient(135deg,#1e1537 0%,#2d1f52 60%,#3b2870 100%)'}}>
        <div>
          <h2 className="text-xl font-bold text-white">ORS-ONE Admin Console</h2>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.userName} · SuperAdmin · Building Transaction Ready Assets</p>
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
          { label: 'Active Deals', value: registeredLeads.length, sub: `${leadsWithProposal.length} with proposal`, good: registeredLeads.length > 0 },
          { label: 'Total Sq.Ft', value: approvedListings.reduce((s, l) => s + (l.sizeSqFt || 0), 0) >= 1000000 ? (approvedListings.reduce((s, l) => s + (l.sizeSqFt || 0), 0) / 1000000).toFixed(1) + 'M' : approvedListings.reduce((s, l) => s + (l.sizeSqFt || 0), 0).toLocaleString(), sub: 'Across active listings', good: false },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl p-4" style={{background:'#fff', border: (kpi as any).alert ? '1px solid #fde68a' : '1px solid hsl(259 30% 91%)', borderTop: (kpi as any).alert ? '3px solid #f59e0b' : (kpi as any).good ? '3px solid #22c55e' : '3px solid transparent'}}>
            <p className="text-2xl font-bold" style={{color:'#1e1537',letterSpacing:'-0.5px'}}>{kpi.value}</p>
            <p className="text-xs font-medium mt-1" style={{color:'#888',textTransform:'uppercase',letterSpacing:'.4px'}}>{kpi.label}</p>
            <p className="text-xs mt-1" style={{color: (kpi as any).alert ? '#d97706' : '#aaa'}}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Approval queue + Deal pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{background:'#fff',border:'1px solid hsl(259 30% 91%)'}}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{color:'#1e1537'}}>
              Approval Queue
              {pendingApprovals.length > 0 && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#fef9c3',color:'#92400e'}}>{pendingApprovals.length}</span>}
            </p>
            <a href="/dashboard/manage-users" className="text-xs font-semibold flex items-center gap-1" style={{color:'#6141ac'}}>Manage Users <ChevronRight className="h-3 w-3"/></a>
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
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{background:'hsl(259 44% 90%)',color:'#6141ac'}}>{(item.name||'').slice(0,2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:'#1e1537'}}>{item.name}</p>
                    <p className="text-xs truncate" style={{color:'#aaa'}}>{item.sub}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={item.badge==='Listing'?{background:'#f0edfb',color:'#6141ac'}:item.badge==='Sublease'?{background:'#fef9c3',color:'#92400e'}:item.badge==='Developer'?{background:'#eff6ff',color:'#1d4ed8'}:{background:'#f0fdf4',color:'#15803d'}}>{item.badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
                  <div className="h-full rounded-lg flex items-center px-2 transition-all" style={{width:`${Math.max((p.count/maxPipe)*100,p.count>0?12:0)}%`,background:p.color}}>
                    {p.count > 0 && <span className="text-xs font-bold text-white">{p.count}</span>}
                  </div>
                </div>
                <span className="text-xs font-bold w-4 text-right flex-shrink-0" style={{color:'#1e1537'}}>{p.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 grid grid-cols-3 gap-2" style={{borderTop:'1px solid hsl(259 30% 91%)'}}>
            {[{label:'Developers',value:developers.length,color:'#eff6ff',text:'#1d4ed8'},{label:'Customers',value:customers.length,color:'#f0fdf4',text:'#15803d'},{label:'Active Leads',value:registeredLeads.length,color:'#f0edfb',text:'#6141ac'}].map((s,i)=>(
              <div key={i} className="rounded-xl p-3 text-center" style={{background:s.color}}>
                <p className="text-base font-bold" style={{color:s.text}}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{color:'#aaa'}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users', sub: `${pendingUsers.length} pending`, href: '/dashboard/manage-users', alert: pendingUsers.length > 0 },
          { label: 'All Listings', sub: `${approvedListings.length} active`, onClick: () => setTab('all-listings'), alert: false },
          { label: 'All Demands', sub: `${demands.length} active`, onClick: () => setTab('all-demands'), alert: false },
          { label: 'Analytics', sub: 'Views & downloads', href: '/dashboard/analytics', alert: false },
        ].map((nav, i) => (
          <a key={i} href={(nav as any).href || '#'}
            onClick={(nav as any).onClick ? (e) => { e.preventDefault(); (nav as any).onClick(); } : undefined}
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

      {/* Tab bar */}
      <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 91%)'}}>
        <div className="flex overflow-x-auto" style={{background:'hsl(259 30% 96%)'}}>
          {tabs.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className="flex items-center justify-center gap-1.5 py-3 px-3 text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={tab === t.value ? {background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac'} : {background:'transparent',color:'#888',borderBottom:'2px solid transparent'}}>
              <t.icon className="h-3.5 w-3.5"/>
              {t.label}
              {t.value === 'approval-queue' && hasPendingSubmissions && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping ml-1"/>}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'approval-queue' && <ApprovalQueue />}
          {tab === 'all-listings' && <AdminListings />}
          {tab === 'all-demands' && <DemandList />}
          {tab === 'create-demand' && <DemandForm onDemandLogged={() => setTab('all-demands')} isAdminMode />}
          {tab === 'all-leads' && <ProviderLeads />}
          {tab === 'my-shortlist' && <GeneralShortlist />}
          {tab === 'ors-transact-manage' && <OrsTransactManager />}
          {tab === 'ors-transact-new' && <OrsTransactAdminForm onSaved={() => setTab('ors-transact-manage')} onCancel={() => setTab('ors-transact-manage')} />}
          {tab === 'ors-transact-import' && <OrsTransactImport />}
          {tab === 'ors-transact-roles' && <OrsTransactRoleManager />}
          {tab === 'engagement-jobs' && <EngagementJobsPanel />}
        </div>
      </div>
    </div>
  );
}
