'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, CheckCircle2, Building2, ListChecks, Users,
  Zap, Search, Monitor, Plus, Upload, Shield, UserCheck,
  RefreshCw, Database, BarChart2, TrendingUp, Globe, MessageSquare,
  Settings, ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  section?: string;
  alert?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Command Centre', icon: LayoutDashboard, href: '/dashboard' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Approval Queue', icon: CheckCircle2, href: '/dashboard/operations', section: 'approval-queue', alert: true },
      { label: 'All Listings', icon: Building2, href: '/dashboard/operations', section: 'all-listings' },
      { label: 'All Demands', icon: ListChecks, href: '/dashboard/operations', section: 'all-demands' },
      { label: 'All Leads', icon: Users, href: '/dashboard/operations', section: 'all-leads' },
      { label: 'Engagement Jobs', icon: Zap, href: '/dashboard/operations', section: 'engagement-jobs' },
      { label: 'Search Console', icon: Search, href: '/dashboard/search-console' },
    ],
  },
  {
    group: 'ORS Transact',
    items: [
      { label: 'Manage Listings', icon: Monitor, href: '/dashboard/operations', section: 'ors-transact-manage' },
      { label: 'New Listing', icon: Plus, href: '/dashboard/operations', section: 'ors-transact-new' },
      { label: 'Import', icon: Upload, href: '/dashboard/operations', section: 'ors-transact-import' },
      { label: 'Role Permissions', icon: Shield, href: '/dashboard/operations', section: 'ors-transact-roles' },
    ],
  },
  {
    group: 'Users & Access',
    items: [
      { label: 'Platform Users', icon: Users, href: '/dashboard/manage-users', section: 'users' },
      { label: 'Agent Waitlist', icon: UserCheck, href: '/dashboard/manage-users', section: 'agents' },
      { label: 'Internal Staff', icon: Shield, href: '/dashboard/manage-users', section: 'staff' },
      { label: 'Data Governance', icon: Database, href: '/dashboard/manage-users', section: 'governance' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Analytics Hub', icon: BarChart2, href: '/dashboard/analytics' },
      { label: 'Listings Performance', icon: TrendingUp, href: '/dashboard/analytics/listings-performance' },
      { label: 'Customer Engagement', icon: Users, href: '/dashboard/analytics/customer' },
      { label: 'Platform Traffic', icon: Globe, href: '/dashboard/analytics/traffic' },
      { label: 'Community', icon: MessageSquare, href: '/dashboard/analytics/community' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ],
  },
];

const S = {
  item: (active: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 14px', border: 'none', cursor: 'pointer', textAlign: 'left' as const,
    background: active ? '#f0edfb' : 'transparent',
    color: active ? '#6141ac' : 'hsl(259 15% 45%)',
    fontWeight: active ? 600 : 400,
    fontSize: 12,
    borderLeft: active ? '2px solid #6141ac' : '2px solid transparent',
    borderRadius: 0,
    textDecoration: 'none',
    transition: 'background .1s',
  }),
  groupLabel: {
    fontSize: 9, fontWeight: 700, color: 'hsl(259 15% 55%)',
    letterSpacing: '.08em', textTransform: 'uppercase' as const,
    padding: '8px 14px 3px', display: 'block',
  } as React.CSSProperties,
  sep: {
    height: '0.5px', background: 'hsl(259 30% 88%)',
    margin: '6px 0',
  } as React.CSSProperties,
};

export function AdminSidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || searchParams.get('tab') || '';

  const isActive = (item: NavItem) => {
    if (item.section) {
      return pathname === item.href && currentSection === item.section;
    }
    if (item.href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(item.href);
  };

  return (
    <div style={{
      width: 196, flexShrink: 0,
      background: 'hsl(259 30% 97%)',
      borderRight: '0.5px solid hsl(259 30% 90%)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Logo strip */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid hsl(259 30% 90%)' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1537', margin: 0 }}>ORS-ONE</p>
        <p style={{ fontSize: 10, color: 'hsl(259 15% 55%)', margin: '2px 0 0' }}>Super Admin Console</p>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {ADMIN_NAV.map((group, gi) => (
          <div key={group.group}>
            {gi > 0 && <div style={S.sep} />}
            <span style={S.groupLabel}>{group.group}</span>
            {group.items.map(item => {
              const active = isActive(item);
              const href = item.section ? `${item.href}?section=${item.section}` : item.href;
              return (
                <Link key={item.label} href={href} style={S.item(active)}>
                  <item.icon style={{ width: 12, height: 12, flexShrink: 0 }} />
                  {item.label}
                  {item.alert && pendingCount > 0 && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User strip */}
      <div style={{ padding: '10px 14px', borderTop: '0.5px solid hsl(259 30% 90%)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, background: '#6141ac', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>SA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#1e1537', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Super Admin</p>
          <p style={{ fontSize: 10, color: 'hsl(259 15% 55%)', margin: 0 }}>Lakshmi Balaji ORS</p>
        </div>
      </div>
    </div>
  );
}
