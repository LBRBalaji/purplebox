'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useSearchParams } from 'next/navigation';
import { AdminSidebar, ADMIN_NAV } from '@/components/admin-sidebar';
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

function SectionHeader({ section }: { section: string }) {
  const allItems = ADMIN_NAV.flatMap(g => g.items.map(i => ({ ...i, group: g.group })));
  const current = allItems.find(i => i.section === section || (!i.section && i.href?.endsWith(section)));
  if (!current) return null;
  const Icon = current.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)' }}>
      <div style={{ width: 30, height: 30, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 14, height: 14, color: '#6141ac' }} />
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>{current.label}</p>
        <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>{current.group}</p>
      </div>
    </div>
  );
}

export default function OperationsPage() {
  const searchParams = useSearchParams();
  const { submissions } = useData();
  const pendingCount = submissions.filter(s => s.status === 'Pending').length;

  const defaultSection = searchParams.get('section') || 'approval-queue';
  const editDemandId = searchParams.get('editDemandId');

  // All state at top — no conditional returns
  const [section, setSection] = React.useState(editDemandId ? 'create-demand' : defaultSection);
  const [editingDemandId, setEditingDemandId] = React.useState<string | null>(editDemandId || null);

  React.useEffect(() => {
    const s = searchParams.get('section');
    const e = searchParams.get('editDemandId');
    if (e) { setEditingDemandId(e); setSection('create-demand'); }
    else if (s) setSection(s);
  }, [searchParams]);

  const handleEditDemand = React.useCallback((demandId: string) => {
    setEditingDemandId(demandId);
    setSection('create-demand');
    setTimeout(() => document.getElementById('ops-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  const go = (s: string) => {
    setSection(s);
    const url = new URL(window.location.href);
    url.searchParams.set('section', s);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar pendingCount={pendingCount} />

      <div id="ops-content" style={{ flex: 1, padding: '24px 28px 56px', overflow: 'auto' }}>
        <SectionHeader section={section} />
        <div>
          {section === 'approval-queue' && <ApprovalQueue />}
          {section === 'all-listings' && <AdminListings />}
          {section === 'all-demands' && <DemandList onEdit={handleEditDemand} />}
          {section === 'create-demand' && <DemandForm onDemandLogged={() => { setEditingDemandId(null); go('all-demands'); }} isAdminMode editDemandId={editingDemandId || undefined} />}
          {section === 'all-leads' && <ProviderLeads />}
          {section === 'shortlist' && <GeneralShortlist />}
          {section === 'ors-transact-manage' && <OrsTransactManager />}
          {section === 'ors-transact-new' && <OrsTransactAdminForm onSaved={() => go('ors-transact-manage')} onCancel={() => go('ors-transact-manage')} />}
          {section === 'ors-transact-import' && <OrsTransactImport />}
          {section === 'ors-transact-roles' && <OrsTransactRoleManager />}
          {section === 'engagement-jobs' && <EngagementJobsPanel />}
        </div>
      </div>
    </div>
  );
}
