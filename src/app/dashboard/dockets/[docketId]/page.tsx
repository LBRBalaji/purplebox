'use client';
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useTransactionDockets, SITE_STATUS_OPTIONS, renderRichText } from '@/hooks/use-transaction-dockets';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, Flag, ChevronDown } from 'lucide-react';
import type { TransactionDocket, ListingSchema } from '@/lib/schema';

const FLAG_CYCLE: Record<string, 'red' | 'yellow' | undefined> = {
  red: 'yellow', yellow: undefined,
};

const flagStyle = (flag?: string): React.CSSProperties => ({
  fontSize: 9, padding: '1px 5px', borderRadius: 4, fontWeight: 700,
  ...(flag === 'red' ? { background: '#fee2e2', color: '#b91c1c' } :
    flag === 'yellow' ? { background: '#fef9c3', color: '#854d0e' } :
    { background: 'hsl(259 30% 94%)', color: 'hsl(259 15% 55%)' }),
});

export default function DocketBuilderPage() {
  const params = useParams();
  const docketId = params.docketId as string;
  const { user, isLoading: authLoading } = useAuth();
  const { siteOptions } = useSiteOptions();
  const { dockets, updateDocket } = useTransactionDockets();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => {
    if (!authLoading && !hasAccess) router.push('/dashboard');
  }, [authLoading, hasAccess, router]);

  const docket = dockets.find(d => d.docketId === docketId);

  // Local editable copies — debounced save
  const [cellData, setCellData] = React.useState<Record<string, string>>({});
  const [cellFlags, setCellFlags] = React.useState<Record<string, 'red' | 'yellow'>>({});
  const [siteStatuses, setSiteStatuses] = React.useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (docket) {
      setCellData(docket.cellData || {});
      setCellFlags(docket.cellFlags || {});
      setSiteStatuses(docket.siteStatuses || {});
    }
  }, [docket?.docketId]);

  const sites = React.useMemo(() =>
    (docket?.siteIds || []).map(id => siteOptions.find(s => s.listingId === id)).filter(Boolean) as ListingSchema[],
    [docket?.siteIds, siteOptions]);

  const level1Params = docket?.params.filter(p => p.level === 1).sort((a, b) => a.order - b.order) || [];
  const level2Params = docket?.params.filter(p => p.level === 2).sort((a, b) => a.order - b.order) || [];

  const cellKey = (paramId: string, listingId: string) => `${paramId}__${listingId}`;

  const openEdit = (key: string) => {
    setEditingCell(key);
    setEditValue(cellData[key] || '');
  };

  const commitEdit = async () => {
    if (!editingCell || !docket) return;
    const updated = { ...cellData, [editingCell]: editValue };
    setCellData(updated);
    setEditingCell(null);
    setSaving(true);
    await updateDocket(docket.docketId, { cellData: updated, updatedAt: new Date().toISOString() });
    setSaving(false);
  };

  const toggleFlag = async (key: string) => {
    if (!docket) return;
    const current = cellFlags[key];
    const next = current === 'red' ? 'yellow' : current === 'yellow' ? undefined : 'red';
    const updated = { ...cellFlags };
    if (next) updated[key] = next; else delete updated[key];
    setCellFlags(updated);
    await updateDocket(docket.docketId, { cellFlags: updated, updatedAt: new Date().toISOString() });
  };

  const changeStatus = async (listingId: string, level: 1 | 2, value: string) => {
    if (!docket) return;
    const sk = `${listingId}__L${level}`;
    const updated = { ...siteStatuses, [sk]: value };
    setSiteStatuses(updated);
    const history = [...(docket.statusHistory || []), {
      listingId, level, from: siteStatuses[sk], to: value, by: 'admin' as const, at: new Date().toISOString(),
    }];
    await updateDocket(docket.docketId, { siteStatuses: updated, statusHistory: history, updatedAt: new Date().toISOString() });
  };

  const copyShareLink = () => {
    if (!docket) return;
    const url = `${window.location.origin}/docket/${docket.docketId}?v=${docket.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      toast({ title: 'Link copied', description: 'Send this to your client — no account needed.' });
    });
  };

  const flagCount = (listingId: string) =>
    Object.entries(cellFlags).filter(([k, v]) => k.includes(`__${listingId}`) && v).length;

  const thStyle: React.CSSProperties = {
    padding: '10px 12px', background: 'hsl(259 30% 97%)',
    border: '0.5px solid hsl(259 30% 88%)', minWidth: 160, maxWidth: 220,
    textAlign: 'left', position: 'sticky', top: 0, zIndex: 1,
  };
  const tdStyle: React.CSSProperties = {
    padding: '8px 10px', border: '0.5px solid hsl(259 30% 92%)',
    verticalAlign: 'top', fontSize: 12, minWidth: 160,
  };
  const rowLabelStyle: React.CSSProperties = {
    padding: '8px 12px', border: '0.5px solid hsl(259 30% 92%)',
    fontSize: 12, color: 'hsl(259 15% 45%)', background: 'hsl(259 30% 98%)',
    whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 2, minWidth: 180,
  };
  const groupHeaderStyle: React.CSSProperties = {
    padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#6141ac',
    textTransform: 'uppercase', letterSpacing: '.06em',
    background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 30% 90%)',
    position: 'sticky', left: 0,
  };

  if (authLoading || !hasAccess) return null;
  if (!docket && !authLoading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: 'hsl(259 15% 55%)' }}>Docket not found.</p>
      </div>
    </div>
  );
  if (!docket) return null;

  const renderParamRows = (paramsList: typeof level1Params, level: 1 | 2) => {
    const groups: Record<string, typeof level1Params> = {};
    paramsList.forEach(p => { (groups[p.groupLabel] = groups[p.groupLabel] || []).push(p); });
    return Object.entries(groups).flatMap(([groupLabel, groupParams]) => [
      <tr key={`group-${level}-${groupLabel}`}>
        <td colSpan={sites.length + 1} style={groupHeaderStyle}>
          Level {level} — {groupLabel}
        </td>
      </tr>,
      ...groupParams.map(param => (
        <tr key={param.paramId}>
          <td style={rowLabelStyle}>{param.label}</td>
          {sites.map(site => {
            const key = cellKey(param.paramId, site.listingId);
            const flag = cellFlags[key];
            const isEditing = editingCell === key;
            return (
              <td key={site.listingId}
                style={{ ...tdStyle, background: flag === 'red' ? '#fee2e2' : flag === 'yellow' ? '#fef9c3' : '#fff', cursor: 'pointer', position: 'relative' }}
                onClick={() => !isEditing && openEdit(key)}>
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => { if (e.key === 'Escape') setEditingCell(null); if (e.key === 'Enter' && e.metaKey) commitEdit(); }}
                    style={{ width: '100%', minHeight: 60, fontSize: 12, border: '1px solid #6141ac', borderRadius: 4, padding: 4, resize: 'vertical', outline: 'none' }}
                  />
                ) : (
                  <div style={{ minHeight: 28, lineHeight: 1.5 }}>
                    {cellData[key] ? renderRichText(cellData[key]) : <span style={{ color: 'hsl(259 15% 70%)' }}>—</span>}
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); toggleFlag(key); }}
                  title="Toggle risk flag"
                  style={{ position: 'absolute', top: 4, right: 4, ...flagStyle(flag), cursor: 'pointer', border: 'none' }}>
                  {flag === 'red' ? '🚩' : flag === 'yellow' ? '⚠' : '·'}
                </button>
              </td>
            );
          })}
        </tr>
      )),
      // Status row at bottom of each level
      <tr key={`status-${level}`} style={{ background: 'hsl(259 44% 97%)' }}>
        <td style={{ ...rowLabelStyle, fontWeight: 600, color: '#1e1537' }}>Status — Level {level}</td>
        {sites.map(site => {
          const sk = `${site.listingId}__L${level}`;
          const current = siteStatuses[sk] || 'Not Decided';
          return (
            <td key={site.listingId} style={{ ...tdStyle, background: 'hsl(259 44% 97%)' }}>
              <select
                value={current}
                onChange={e => changeStatus(site.listingId, level, e.target.value)}
                style={{ fontSize: 12, width: '100%', border: '0.5px solid hsl(259 30% 85%)', borderRadius: 6, padding: '4px 6px', background: '#fff', color: current === 'Selected' ? '#166534' : current === 'Rejected' ? '#b91c1c' : '#1e1537' }}>
                {SITE_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </td>
          );
        })}
      </tr>,
    ]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid hsl(259 30% 90%)', background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard/dockets')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'hsl(259 15% 55%)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Dockets
          </button>
          <div style={{ width: 1, height: 20, background: 'hsl(259 30% 88%)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1e1537', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docket.title}</p>
            <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>{docket.clientName}{docket.clientCompany ? ` · ${docket.clientCompany}` : ''} · {sites.length} site{sites.length !== 1 ? 's' : ''}</p>
          </div>
          {saving && <span style={{ fontSize: 11, color: '#6141ac' }}>Saving…</span>}
          <Button onClick={copyShareLink} variant="outline" size="sm" style={{ gap: 4, borderColor: '#6141ac', color: '#6141ac' }}>
            {copiedLink ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
            {copiedLink ? 'Copied' : 'Share with client'}
          </Button>
        </div>

        {/* Legend */}
        <div style={{ padding: '8px 20px', background: 'hsl(259 30% 98%)', borderBottom: '0.5px solid hsl(259 30% 90%)', display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'hsl(259 15% 55%)' }}>
          <span>Click any cell to edit · <kbd style={{ fontSize: 10, padding: '1px 4px', border: '0.5px solid hsl(259 30% 80%)', borderRadius: 3 }}>⌘ Enter</kbd> or click outside to save</span>
          <span>🚩 = critical risk · ⚠ = moderate · click flag to cycle</span>
          <span>**bold** · - bullet · 1. numbered</span>
        </div>

        {/* Comparison table */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', overflow: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 180, position: 'sticky', left: 0, zIndex: 3 }}>Parameter</th>
                  {sites.map(site => {
                    const fc = flagCount(site.listingId);
                    return (
                      <th key={site.listingId} style={thStyle}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                          <div>
                            <p style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1e1537', margin: 0 }}>{site.listingId}</p>
                            <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: '2px 0 0' }}>{site.location}</p>
                          </div>
                          {fc > 0 && (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#fee2e2', color: '#b91c1c', fontWeight: 700, flexShrink: 0 }}>
                              {fc} flag{fc > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {renderParamRows(level1Params, 1)}
                {renderParamRows(level2Params, 2)}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 11, color: 'hsl(259 15% 60%)', marginTop: 12 }}>
            Stage 2 (post site-visit findings) will unlock as deals progress. · Last updated: {new Date(docket.updatedAt || docket.createdAt || '').toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
