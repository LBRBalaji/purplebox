'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { CheckCircle2, TrendingUp, Building2, Users, FileText, Zap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminDashboard() {
  const { user, users } = useAuth();
  const { listings, demands, registeredLeads, submissions } = useData();

  const allUsers = Object.values(users || {}) as any[];
  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const approvedUsers = allUsers.filter(u => u.status === 'approved');
  const developers = approvedUsers.filter(u => u.role === 'Warehouse Developer');
  const customers = approvedUsers.filter(u => u.role === 'User');
  const approvedListings = listings.filter(l => l.status === 'approved');
  const pendingListings = listings.filter(l => l.status === 'pending');
  const leadsWithProposal = registeredLeads.filter(l => l.providers?.some((p: any) => p.properties?.[0]?.rentPerSft !== undefined));
  const totalSqFt = approvedListings.reduce((s, l) => s + (l.sizeSqFt || 0), 0);
  const pendingTotal = pendingListings.length + pendingUsers.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.userName?.split(' ')[0] || 'Balaji';

  const pendingItems = [
    ...pendingListings.map(l => ({ name: l.name || l.listingId, sub: `${l.location?.split(',')[0] || ''} · ${(l.sizeSqFt || 0).toLocaleString()} sft`, badge: l.listingType === 'Sublease' ? 'Sublease' : 'Listing', bg: '#f0edfb', tc: '#3C3489' })),
    ...pendingUsers.map(u => ({ name: u.companyName || u.userName, sub: `${u.role} · ${u.email}`, badge: u.role === 'Warehouse Developer' ? 'Developer' : 'Customer', bg: u.role === 'Warehouse Developer' ? '#E6F1FB' : '#EAF3DE', tc: u.role === 'Warehouse Developer' ? '#0C447C' : '#27500A' })),
  ].slice(0, 6);

  const pipeline = [
    { label: 'Chat', count: registeredLeads.length, w: 100 },
    { label: 'Proposal', count: leadsWithProposal.length, w: Math.round((leadsWithProposal.length / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'Negotiation', count: Math.floor(leadsWithProposal.length * 0.6), w: Math.round((leadsWithProposal.length * 0.6 / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'Fit-Out', count: Math.floor(leadsWithProposal.length * 0.3), w: Math.round((leadsWithProposal.length * 0.3 / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'MoU', count: Math.floor(leadsWithProposal.length * 0.1), w: Math.round((leadsWithProposal.length * 0.1 / Math.max(registeredLeads.length, 1)) * 100) },
  ];

  const kpis = [
    { label: 'Active Listings', value: approvedListings.length, sub: pendingListings.length > 0 ? `${pendingListings.length} pending review` : 'All approved', warn: pendingListings.length > 0 },
    { label: 'Registered Users', value: approvedUsers.length, sub: `${developers.length} developers · ${customers.length} customers`, warn: pendingUsers.length > 0, warnSub: pendingUsers.length > 0 ? `${pendingUsers.length} awaiting approval` : undefined },
    { label: 'Active Deals', value: registeredLeads.length, sub: `${leadsWithProposal.length} with proposal` },
    { label: 'Sq.Ft Listed', value: totalSqFt >= 1000000 ? `${(totalSqFt / 1000000).toFixed(1)}M` : totalSqFt.toLocaleString(), sub: 'Direct deal' },
  ];

  const T = {
    card: { background: '#fff', border: '0.5px solid hsl(259 30% 90%)', borderRadius: 0, padding: '16px 18px' } as React.CSSProperties,
    kpi: (warn: boolean) => ({ background: '#fff', border: warn ? '0.5px solid #EF9F27' : '0.5px solid hsl(259 30% 90%)', borderRadius: 0, padding: '14px 16px', borderTop: warn ? '2px solid #EF9F27' : '2px solid transparent' }) as React.CSSProperties,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar pendingCount={pendingTotal} />

      <div style={{ flex: 1, padding: '28px 28px 56px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e1537', margin: 0 }}>{greeting}, {firstName}</h1>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: '4px 0 0' }}>ORS-ONE · Super Admin · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {pendingTotal > 0 && (
            <Link href="/dashboard/operations?section=approval-queue"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '0.5px solid #EF9F27', borderRadius: 0, textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#854F0B' }}>
              <AlertTriangle style={{ width: 13, height: 13 }} />
              {pendingTotal} pending approval{pendingTotal > 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, marginBottom: 20, background: 'hsl(259 30% 88%)', border: '0.5px solid hsl(259 30% 88%)' }}>
          {kpis.map((k, i) => (
            <div key={i} style={T.kpi(!!k.warn)}>
              <p style={{ fontSize: 26, fontWeight: 700, color: '#1e1537', margin: 0, letterSpacing: '-0.5px' }}>{k.value}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'hsl(259 15% 55%)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '5px 0 3px' }}>{k.label}</p>
              <p style={{ fontSize: 11, color: k.warn ? '#854F0B' : 'hsl(259 15% 60%)', margin: 0 }}>{k.warnSub || k.sub}</p>
            </div>
          ))}
        </div>

        {/* Middle grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'hsl(259 30% 88%)', marginBottom: 20 }}>
          {/* Approval queue */}
          <div style={{ ...T.card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1537', margin: 0 }}>Approval Queue</p>
                {pendingItems.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: '#FAEEDA', color: '#633806', padding: '1px 7px' }}>{pendingItems.length}</span>}
              </div>
              <Link href="/dashboard/manage-users" style={{ fontSize: 11, color: '#6141ac', textDecoration: 'none', fontWeight: 600 }}>Manage users →</Link>
            </div>
            {pendingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 style={{ width: 28, height: 28, color: '#639922', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>All clear</p>
                <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: '3px 0 0' }}>No pending approvals</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {pendingItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 90%)' }}>
                    <div style={{ width: 28, height: 28, background: '#f0edfb', color: '#6141ac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{item.name.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#1e1537', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: 10, color: 'hsl(259 15% 55%)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', flexShrink: 0, background: item.bg, color: item.tc }}>{item.badge}</span>
                  </div>
                ))}
                <Link href="/dashboard/operations?section=approval-queue"
                  style={{ display: 'block', textAlign: 'center', padding: '7px', fontSize: 11, fontWeight: 600, color: '#6141ac', background: 'hsl(259 44% 96%)', textDecoration: 'none', marginTop: 4, border: '0.5px solid hsl(259 44% 82%)' }}>
                  View all in Operations →
                </Link>
              </div>
            )}
          </div>

          {/* Deal pipeline */}
          <div style={{ ...T.card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1537', margin: 0 }}>Deal Pipeline</p>
              <TrendingUp style={{ width: 14, height: 14, color: '#6141ac' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {pipeline.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'hsl(259 15% 55%)', width: 68, flexShrink: 0 }}>{p.label}</span>
                  <div style={{ flex: 1, height: 20, background: 'hsl(259 30% 96%)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(p.w, p.count > 0 ? 6 : 0)}%`, background: i === 0 ? '#378ADD' : '#6141ac', display: 'flex', alignItems: 'center', paddingLeft: 7, minWidth: p.count > 0 ? 28 : 0 }}>
                      {p.count > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{p.count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'hsl(259 30% 88%)', paddingTop: 1 }}>
              {[{ label: 'Developers', value: developers.length, bg: '#E6F1FB', tc: '#0C447C' }, { label: 'Customers', value: customers.length, bg: '#EAF3DE', tc: '#27500A' }, { label: 'Active Leads', value: registeredLeads.length, bg: '#f0edfb', tc: '#3C3489' }].map((s, i) => (
                <div key={i} style={{ background: s.bg, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: s.tc, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: s.tc, opacity: 0.7, margin: '2px 0 0' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'hsl(259 15% 55%)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Quick actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'hsl(259 30% 88%)' }}>
            {[
              { label: 'Manage Users', sub: `${pendingUsers.length} pending`, href: '/dashboard/manage-users', icon: Users, warn: pendingUsers.length > 0 },
              { label: 'All Listings', sub: `${approvedListings.length} active`, href: '/dashboard/operations?section=all-listings', icon: Building2 },
              { label: 'All Demands', sub: `${demands.length} active`, href: '/dashboard/operations?section=all-demands', icon: ListChecks },
              { label: 'Engagement Jobs', sub: 'Automate outreach', href: '/dashboard/operations?section=engagement-jobs', icon: Zap },
            ].map((nav, i) => (
              <Link key={i} href={nav.href}
                style={{ background: '#fff', padding: '14px 16px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10, borderTop: nav.warn ? '2px solid #EF9F27' : '2px solid transparent' }}>
                <div style={{ width: 28, height: 28, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <nav.icon style={{ width: 13, height: 13, color: '#6141ac' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1e1537', margin: 0 }}>{nav.label}</p>
                  <p style={{ fontSize: 11, color: nav.warn ? '#854F0B' : 'hsl(259 15% 55%)', margin: '2px 0 0' }}>{nav.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ORS Transact strip */}
        <div style={{ background: '#1e1537', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.07em', textTransform: 'uppercase', margin: 0 }}>ORS Transact</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '4px 0 3px' }}>9,420 inventory listings</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', margin: 0 }}>242.9M sft · Managed directly by ORS-ONE</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/dashboard/operations?section=ors-transact-manage"
              style={{ padding: '7px 14px', background: 'rgba(255,255,255,.08)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '0.5px solid rgba(255,255,255,.15)' }}>
              Manage Listings
            </Link>
            <Link href="/ors-transact" target="_blank"
              style={{ padding: '7px 14px', background: '#6141ac', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
              Public View ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
