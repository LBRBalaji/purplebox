'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSearchParams } from 'next/navigation';
import {
  Building2, Users, TrendingUp, ChevronRight, CheckCircle2,
  LayoutDashboard, Settings, AlertTriangle, Zap, FileText
} from 'lucide-react';
import Link from 'next/link';

// ── Shared sidebar used by both admin pages ───────────────────────────────────
const NAV_GROUPS = [
  {
    group: 'Platform',
    items: [
      { label: 'Approval Queue', href: '/dashboard/operations?section=approval-queue', alert: true },
      { label: 'All Listings', href: '/dashboard/operations?section=all-listings' },
      { label: 'All Demands', href: '/dashboard/operations?section=all-demands' },
      { label: 'Create Demand', href: '/dashboard/operations?section=create-demand' },
      { label: 'All Leads', href: '/dashboard/operations?section=all-leads' },
    ],
  },
  {
    group: 'ORS Transact',
    items: [
      { label: 'Manage Listings', href: '/dashboard/operations?section=ors-transact-manage' },
      { label: 'New Listing', href: '/dashboard/operations?section=ors-transact-new' },
      { label: 'Import', href: '/dashboard/operations?section=ors-transact-import' },
      { label: 'Role Permissions', href: '/dashboard/operations?section=ors-transact-roles' },
    ],
  },
  {
    group: 'Automation',
    items: [
      { label: 'Engagement Jobs', href: '/dashboard/operations?section=engagement-jobs' },
    ],
  },
];

function AdminSidebar({ active }: { active: 'dashboard' | 'operations' }) {
  return (
    <div style={{ width: 200, flexShrink: 0, background: 'hsl(259 30% 97%)', borderRight: '0.5px solid hsl(259 30% 90%)', display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '16px 8px' }}>
      {/* Top nav */}
      <div style={{ marginBottom: 16 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, textDecoration: 'none', background: active === 'dashboard' ? '#f0edfb' : 'transparent', color: active === 'dashboard' ? '#6141ac' : 'hsl(259 15% 45%)', fontWeight: active === 'dashboard' ? 700 : 500, fontSize: 12 }}>
          <LayoutDashboard style={{ width: 13, height: 13 }} /> Command Centre
        </Link>
        <Link href="/dashboard/operations" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, textDecoration: 'none', background: active === 'operations' ? '#f0edfb' : 'transparent', color: active === 'operations' ? '#6141ac' : 'hsl(259 15% 45%)', fontWeight: active === 'operations' ? 700 : 500, fontSize: 12, marginTop: 2 }}>
          <Settings style={{ width: 13, height: 13 }} /> Operations
        </Link>
      </div>

      <div style={{ height: '0.5px', background: 'hsl(259 30% 88%)', marginBottom: 12 }} />

      {/* Section nav */}
      {NAV_GROUPS.map(g => (
        <div key={g.group} style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'hsl(259 15% 55%)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 10px 5px' }}>{g.group}</p>
          {g.items.map(item => (
            <Link key={item.label} href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 6, textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12, fontWeight: 500 }}>
              {item.label}
              {(item as any).alert && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />}
            </Link>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px 10px 0', borderTop: '0.5px solid hsl(259 30% 88%)' }}>
        <Link href="/dashboard/analytics" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12 }}>
          <TrendingUp style={{ width: 13, height: 13 }} /> Analytics
        </Link>
        <Link href="/dashboard/manage-users" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12 }}>
          <Users style={{ width: 13, height: 13 }} /> Manage Users
        </Link>
      </div>
    </div>
  );
}

// ── Command Centre (main dashboard) ──────────────────────────────────────────
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
  const hasPending = pendingListings.length > 0 || pendingUsers.length > 0;
  const leadsWithProposal = registeredLeads.filter(l => l.providers?.some((p: any) => p.properties?.[0]?.rentPerSft !== undefined));
  const totalSqFt = approvedListings.reduce((s, l) => s + (l.sizeSqFt || 0), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const pendingItems = [
    ...pendingListings.map(l => ({ name: l.name || l.listingId, sub: `${l.location?.split(',')[0]} · ${l.sizeSqFt?.toLocaleString()} sft`, badge: l.listingType === 'Sublease' ? 'Sublease' : 'Listing', badgeColor: { bg: '#f0edfb', text: '#6141ac' } })),
    ...pendingUsers.map(u => ({ name: u.companyName || u.userName, sub: `${u.role} · ${u.email}`, badge: u.role === 'Warehouse Developer' ? 'Developer' : 'Customer', badgeColor: u.role === 'Warehouse Developer' ? { bg: '#eff6ff', text: '#1d4ed8' } : { bg: '#f0fdf4', text: '#15803d' } })),
  ].slice(0, 6);

  const pipeline = [
    { label: 'Chat', count: registeredLeads.length, pct: 100 },
    { label: 'Proposal', count: leadsWithProposal.length, pct: Math.round((leadsWithProposal.length / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'Negotiation', count: Math.floor(leadsWithProposal.length * 0.6), pct: Math.round((leadsWithProposal.length * 0.6 / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'Fit-Out', count: Math.floor(leadsWithProposal.length * 0.3), pct: Math.round((leadsWithProposal.length * 0.3 / Math.max(registeredLeads.length, 1)) * 100) },
    { label: 'MoU', count: Math.floor(leadsWithProposal.length * 0.1), pct: Math.round((leadsWithProposal.length * 0.1 / Math.max(registeredLeads.length, 1)) * 100) },
  ];

  const kpis = [
    { label: 'Active Listings', value: approvedListings.length, sub: pendingListings.length > 0 ? `${pendingListings.length} pending review` : 'All approved', alert: pendingListings.length > 0 },
    { label: 'Registered Users', value: approvedUsers.length, sub: `${developers.length} developers · ${customers.length} customers`, alert: pendingUsers.length > 0, alertSub: pendingUsers.length > 0 ? `${pendingUsers.length} awaiting approval` : undefined },
    { label: 'Active Deals', value: registeredLeads.length, sub: `${leadsWithProposal.length} with proposal`, good: registeredLeads.length > 0 },
    { label: 'Sq.Ft Listed', value: totalSqFt >= 1000000 ? `${(totalSqFt / 1000000).toFixed(1)}M` : totalSqFt.toLocaleString(), sub: 'Direct deal listings', neutral: true },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar active="dashboard" />

      <div style={{ flex: 1, padding: '28px 28px 48px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e1537', margin: 0 }}>{greeting}, {user?.userName?.split(' ')[0]}</h1>
              <p style={{ fontSize: 13, color: 'hsl(259 15% 50%)', marginTop: 3 }}>ORS-ONE · SuperAdmin · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            {hasPending && (
              <Link href="/dashboard/operations?section=approval-queue"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #fde68a', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                <AlertTriangle style={{ width: 13, height: 13 }} />
                {pendingListings.length + pendingUsers.length} pending approval{pendingListings.length + pendingUsers.length > 1 ? 's' : ''}
              </Link>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {kpis.map((kpi, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 12, padding: '16px 18px',
              border: kpi.alert ? '1px solid #fde68a' : '0.5px solid hsl(259 30% 90%)',
              borderTop: kpi.alert ? '3px solid #f59e0b' : kpi.good ? '3px solid #22c55e' : '3px solid transparent',
            }}>
              <p style={{ fontSize: 26, fontWeight: 700, color: '#1e1537', margin: 0, letterSpacing: '-0.5px' }}>{kpi.value}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'hsl(259 15% 55%)', textTransform: 'uppercase', letterSpacing: '.04em', margin: '5px 0 3px' }}>{kpi.label}</p>
              {kpi.alertSub
                ? <p style={{ fontSize: 11, color: '#d97706', margin: 0 }}>{kpi.alertSub}</p>
                : <p style={{ fontSize: 11, color: 'hsl(259 15% 60%)', margin: 0 }}>{kpi.sub}</p>}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Approval queue */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid hsl(259 30% 90%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Approval Queue</p>
                {pendingItems.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: '#fef9c3', color: '#92400e', padding: '1px 7px', borderRadius: 10 }}>{pendingItems.length}</span>}
              </div>
              <Link href="/dashboard/manage-users" style={{ fontSize: 11, fontWeight: 600, color: '#6141ac', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>Manage Users <ChevronRight style={{ width: 12, height: 12 }} /></Link>
            </div>
            {pendingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 style={{ width: 32, height: 32, color: '#22c55e', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e1537', margin: 0 }}>All clear</p>
                <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: '3px 0 0' }}>No pending approvals</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendingItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'hsl(259 30% 98%)' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(259 44% 90%)', color: '#6141ac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{item.name.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0, background: item.badgeColor.bg, color: item.badgeColor.text }}>{item.badge}</span>
                  </div>
                ))}
                <Link href="/dashboard/operations?section=approval-queue"
                  style={{ display: 'block', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 600, color: '#6141ac', background: 'hsl(259 44% 96%)', borderRadius: 8, textDecoration: 'none', marginTop: 4 }}>
                  View all in Operations →
                </Link>
              </div>
            )}
          </div>

          {/* Deal pipeline */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '0.5px solid hsl(259 30% 90%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Deal Pipeline</p>
              <TrendingUp style={{ width: 15, height: 15, color: '#6141ac' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {pipeline.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'hsl(259 15% 55%)', width: 72, flexShrink: 0 }}>{p.label}</span>
                  <div style={{ flex: 1, height: 22, background: 'hsl(259 30% 96%)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(p.pct, p.count > 0 ? 8 : 0)}%`, background: i === 0 ? '#3b82f6' : '#6141ac', display: 'flex', alignItems: 'center', paddingLeft: 8, transition: 'width .3s' }}>
                      {p.count > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.count}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e1537', width: 24, textAlign: 'right', flexShrink: 0 }}>{p.count}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 14, borderTop: '0.5px solid hsl(259 30% 90%)' }}>
              {[{ label: 'Developers', value: developers.length, bg: '#eff6ff', text: '#1d4ed8' }, { label: 'Customers', value: customers.length, bg: '#f0fdf4', text: '#15803d' }, { label: 'Active Leads', value: registeredLeads.length, bg: '#f0edfb', text: '#6141ac' }].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: s.text, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: s.text, opacity: 0.7, margin: '2px 0 0' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'hsl(259 15% 55%)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Manage Users', sub: `${pendingUsers.length} pending`, href: '/dashboard/manage-users', icon: Users, alert: pendingUsers.length > 0 },
              { label: 'All Listings', sub: `${approvedListings.length} active`, href: '/dashboard/operations?section=all-listings', icon: Building2, alert: false },
              { label: 'All Demands', sub: `${demands.length} active`, href: '/dashboard/operations?section=all-demands', icon: FileText, alert: false },
              { label: 'Engagement Jobs', sub: 'Automate outreach', href: '/dashboard/operations?section=engagement-jobs', icon: Zap, alert: false },
            ].map((nav, i) => (
              <Link key={i} href={nav.href}
                style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: nav.alert ? '1px solid #fde68a' : '0.5px solid hsl(259 30% 90%)', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, transition: 'box-shadow .15s' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <nav.icon style={{ width: 13, height: 13, color: '#6141ac' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1e1537', margin: 0 }}>{nav.label}</p>
                  <p style={{ fontSize: 11, color: nav.alert ? '#d97706' : 'hsl(259 15% 55%)', margin: '2px 0 0' }}>{nav.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ORS Transact summary */}
        <div style={{ background: '#1e1537', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', margin: 0 }}>ORS Transact</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '4px 0 3px' }}>9,420 inventory listings</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', margin: 0 }}>242.9M sft · Managed directly by ORS-ONE</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/dashboard/operations?section=ors-transact-manage"
              style={{ padding: '8px 16px', background: 'rgba(255,255,255,.1)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,.15)' }}>
              Manage Listings
            </Link>
            <Link href="/ors-transact" target="_blank"
              style={{ padding: '8px 16px', background: '#6141ac', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
              Public View ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
