'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSearchParams } from 'next/navigation';
import { Building2, ListChecks, Zap, FileSignature, Scaling, Users, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { DemandForm } from '@/components/demand-form';
import { MyDemands } from '@/components/my-demands';
import { GeneralShortlist } from '@/components/general-shortlist';
import { CustomerTransactions } from '@/components/customer-transactions';
import { CustomerSubleaseListings } from '@/components/customer-sublease-listings';
import { CompanyAdminDashboard } from '@/components/company-admin-dashboard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { downloadHistory, registeredLeads, generalShortlist, listings, unreadChatCount } = useData();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'my-transactions';
  const editDemandId = searchParams.get('editDemandId');
  const [tab, setTab] = React.useState(editDemandId ? 'log-demand' : defaultTab);

  React.useEffect(() => {
    if (editDemandId) setTab('log-demand');
    else if (defaultTab) setTab(defaultTab);
  }, [editDemandId, defaultTab]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.userName?.split(' ')[0] || 'there';
  const isDemo = user?.email === 'balajispillai@gmail.com';
  const myDownloads = downloadHistory.filter((d: any) => d.userId === user?.email);
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const downloadsToday = myDownloads.filter((d: any) => d.timestamp >= todayStart.getTime()).length;
  const downloadLimit = isDemo ? Infinity : 5;
  const myLeads = registeredLeads.filter((l: any) => l.customerId === user?.email);
  const hasProposalReady = myLeads.some((l: any) => l.providers?.[0]?.properties?.[0]?.rentPerSft !== undefined);
  const activeTransaction = myLeads.find((l: any) => l.providers?.[0]?.properties?.[0]?.rentPerSft !== undefined);
  const shortlistCount = generalShortlist?.length || 0;

  const tabs = [
    { value: 'my-demands', label: 'My Demands', icon: ListChecks },
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
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,.5)'}}>{user?.companyName} · Customer</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {hasProposalReady && <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(245,158,11,.18)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.3)'}}>Proposal ready to review</span>}
          {myLeads.length > 0 && <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{background:'rgba(34,197,94,.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,.25)'}}>{myLeads.length} active deal{myLeads.length > 1 ? 's' : ''}</span>}
          <Link href="/register-deal" className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2" style={{background:'#6141ac',color:'#fff',borderRadius:0}}>
            <FileText className="h-4 w-4" /> Register a Deal
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Downloads Today', value: isDemo ? '∞' : downloadsToday, sub: isDemo ? 'Unlimited' : `${Math.max(0,downloadLimit-downloadsToday)} remaining`, alert: !isDemo && downloadsToday >= downloadLimit },
          { label: 'Shortlisted', value: shortlistCount, sub: 'Saved for review', alert: false },
          { label: 'Active Transactions', value: myLeads.length, sub: myLeads.length > 0 ? 'In progress' : 'None yet', good: myLeads.length > 0 },
          { label: 'Open Chats', value: unreadChatCount > 0 ? `${unreadChatCount}` : '—', sub: unreadChatCount > 0 ? `${unreadChatCount} unread` : 'All caught up', alert: unreadChatCount > 0 },
        ].map((kpi, i) => (
          <div key={i} className="rounded-2xl p-4" style={{background:'#fff', border:(kpi as any).alert?'1px solid #fde68a':'1px solid hsl(259 30% 91%)', borderTop:(kpi as any).alert?'3px solid #f59e0b':(kpi as any).good?'3px solid #22c55e':'3px solid transparent'}}>
            <p className="text-2xl font-bold" style={{color:'#1e1537',letterSpacing:'-0.5px'}}>{kpi.value}</p>
            <p className="text-xs font-medium mt-1" style={{color:'#888',textTransform:'uppercase',letterSpacing:'.4px'}}>{kpi.label}</p>
            <p className="text-xs mt-1" style={{color:(kpi as any).alert?'#d97706':'#aaa'}}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl overflow-hidden" style={{border:'1px solid hsl(259 30% 91%)'}}>
        <div className="flex overflow-x-auto" style={{background:'hsl(259 30% 96%)'}}>
          {tabs.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className="flex items-center justify-center gap-2 py-3 px-3 text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={tab===t.value?{background:'#fff',color:'#6141ac',borderBottom:'2px solid #6141ac',flex:'1 1 auto'}:{background:'transparent',color:'#888',borderBottom:'2px solid transparent',flex:'1 1 auto'}}>
              <t.icon className="h-3.5 w-3.5"/>{t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'my-demands' && <MyDemands onSwitchTab={setTab} />}
          {tab === 'log-demand' && <DemandForm onDemandLogged={() => setTab('my-demands')} />}
          {tab === 'my-shortlist' && <GeneralShortlist />}
          {tab === 'my-transactions' && <CustomerTransactions />}
          {tab === 'my-sublease' && <CustomerSubleaseListings />}
          {tab === 'my-team' && user?.isCompanyAdmin && <CompanyAdminDashboard />}
        </div>
      </div>
    </div>
  );
}
