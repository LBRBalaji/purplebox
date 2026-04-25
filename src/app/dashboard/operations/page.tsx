'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Settings, Building2, ListChecks, FileText,
  Upload, Users, Zap, Plus, TrendingUp, CheckCircle2, AlertTriangle
} from 'lucide-react';
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

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    group: 'Platform',
    items: [
      { value: 'approval-queue', label: 'Approval Queue', icon: CheckCircle2, alert: true },
      { value: 'all-listings', label: 'All Listings', icon: Building2 },
      { value: 'all-demands', label: 'All Demands', icon: ListChecks },
      { value: 'create-demand', label: 'Create Demand', icon: FileText },
      { value: 'all-leads', label: 'All Leads', icon: Users },
      { value: 'shortlist', label: 'Shortlist', icon: Building2 },
    ],
  },
  {
    group: 'ORS Transact',
    items: [
      { value: 'ors-transact-manage', label: 'Manage Listings', icon: Building2 },
      { value: 'ors-transact-new', label: 'New Listing', icon: Plus },
      { value: 'ors-transact-import', label: 'Import', icon: Upload },
      { value: 'ors-transact-roles', label: 'Role Permissions', icon: Users },
    ],
  },
  {
    group: 'Automation',
    items: [
      { value: 'engagement-jobs', label: 'Engagement Jobs', icon: Zap },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ section, setSection, hasPending }: {
  section: string; setSection: (s: string) => void; hasPending: boolean;
}) {
  return (
    <div style={{ width: 200, flexShrink: 0, background: 'hsl(259 30% 97%)', borderRight: '0.5px solid hsl(259 30% 90%)', display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '16px 8px' }}>
      {/* Page switcher */}
      <div style={{ marginBottom: 14 }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 6, textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12, fontWeight: 500 }}>
          <LayoutDashboard style={{ width: 13, height: 13 }} /> Command Centre
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 6, background: '#f0edfb', color: '#6141ac', fontSize: 12, fontWeight: 700 }}>
          <Settings style={{ width: 13, height: 13 }} /> Operations
        </div>
      </div>

      <div style={{ height: '0.5px', background: 'hsl(259 30% 88%)', marginBottom: 10 }} />

      {/* Section items */}
      {NAV_GROUPS.map(g => (
        <div key={g.group} style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'hsl(259 15% 55%)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 10px 4px' }}>{g.group}</p>
          {g.items.map(item => {
            const isActive = section === item.value;
            const showDot = (item as any).alert && hasPending;
            return (
              <button key={item.value} onClick={() => setSection(item.value)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6, background: isActive ? '#fff' : 'transparent', color: isActive ? '#6141ac' : 'hsl(259 15% 45%)', fontWeight: isActive ? 700 : 500, fontSize: 12, borderLeft: isActive ? '2px solid #6141ac' : '2px solid transparent' }}>
                <item.icon style={{ width: 12, height: 12, flexShrink: 0 }} />
                {item.label}
                {showDot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px 10px 0', borderTop: '0.5px solid hsl(259 30% 88%)' }}>
        <Link href="/dashboard/analytics" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0', textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12 }}>
          <TrendingUp style={{ width: 13, height: 13 }} /> Analytics
        </Link>
        <Link href="/dashboard/manage-users" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0', textDecoration: 'none', color: 'hsl(259 15% 45%)', fontSize: 12 }}>
          <Users style={{ width: 13, height: 13 }} /> Manage Users
        </Link>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ section }: { section: string }) {
  const all = NAV_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.group })));
  const current = all.find(i => i.value === section);
  if (!current) return null;
  const Icon = current.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 15, height: 15, color: '#6141ac' }} />
      </div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1537', margin: 0 }}>{current.label}</p>
        <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>{current.group}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OperationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { submissions } = useData();
  const hasPending = submissions.some(s => s.status === 'Pending');

  const defaultSection = searchParams.get('section') || 'approval-queue';
  const editDemandId = searchParams.get('editDemandId');

  // All state unconditionally at top
  const [section, setSection] = React.useState(editDemandId ? 'create-demand' : defaultSection);
  const [editingDemandId, setEditingDemandId] = React.useState<string | null>(editDemandId || null);

  React.useEffect(() => {
    const s = searchParams.get('section');
    if (s) setSection(s);
    const e = searchParams.get('editDemandId');
    if (e) { setEditingDemandId(e); setSection('create-demand'); }
  }, [searchParams]);

  const handleEditDemand = React.useCallback((demandId: string) => {
    setEditingDemandId(demandId);
    setSection('create-demand');
    setTimeout(() => {
      document.getElementById('ops-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const handleSectionChange = (s: string) => {
    setSection(s);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('section', s);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <Sidebar section={section} setSection={handleSectionChange} hasPending={hasPending} />

      <div id="ops-content" style={{ flex: 1, padding: '24px 28px 48px', overflow: 'auto' }}>
        <SectionHeader section={section} />

        {/* Content — hooks rule: all conditional rendering, no conditional returns */}
        <div>
          {section === 'approval-queue' && <ApprovalQueue />}
          {section === 'all-listings' && <AdminListings />}
          {section === 'all-demands' && <DemandList onEdit={handleEditDemand} />}
          {section === 'create-demand' && (
            <DemandForm
              onDemandLogged={() => { setEditingDemandId(null); handleSectionChange('all-demands'); }}
              isAdminMode
              editDemandId={editingDemandId || undefined}
            />
          )}
          {section === 'all-leads' && <ProviderLeads />}
          {section === 'shortlist' && <GeneralShortlist />}
          {section === 'ors-transact-manage' && <OrsTransactManager />}
          {section === 'ors-transact-new' && (
            <OrsTransactAdminForm
              onSaved={() => handleSectionChange('ors-transact-manage')}
              onCancel={() => handleSectionChange('ors-transact-manage')}
            />
          )}
          {section === 'ors-transact-import' && <OrsTransactImport />}
          {section === 'ors-transact-roles' && <OrsTransactRoleManager />}
          {section === 'engagement-jobs' && <EngagementJobsPanel />}
        </div>
      </div>
    </div>
  );
}
