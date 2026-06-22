'use client';
import * as React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { renderRichText, SITE_STATUS_OPTIONS } from '@/hooks/use-transaction-dockets';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Flag } from 'lucide-react';
import Link from 'next/link';
import type { TransactionDocket, ListingSchema } from '@/lib/schema';

export default function PublicDocketPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const docketId = params.docketId as string;
  const token = searchParams.get('v');

  const [docket, setDocket] = React.useState<TransactionDocket | null>(null);
  const [sites, setSites] = React.useState<ListingSchema[]>([]);
  const [siteStatuses, setSiteStatuses] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [invalid, setInvalid] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!docketId) return;
    fetch(`/api/transaction-dockets?id=${docketId}`)
      .then(r => r.json())
      .then(async data => {
        if (!data || data.message === 'Not found' || data.shareToken !== token || data.archived) {
          setInvalid(true); setLoading(false); return;
        }
        setDocket(data);
        setSiteStatuses(data.siteStatuses || {});
        // Fetch site details
        const listingsRes = await fetch('/api/listings');
        const allListings: ListingSchema[] = await listingsRes.json();
        const docketSites = (data.siteIds || []).map((id: string) => allListings.find((l: ListingSchema) => l.listingId === id)).filter(Boolean);
        setSites(docketSites);
        setLoading(false);
      })
      .catch(() => { setInvalid(true); setLoading(false); });
  }, [docketId, token]);

  const changeStatus = async (listingId: string, level: 1 | 2, value: string) => {
    if (!docket) return;
    const sk = `${listingId}__L${level}`;
    setSaving(sk);
    const updated = { ...siteStatuses, [sk]: value };
    setSiteStatuses(updated);
    const history = [...(docket.statusHistory || []), {
      listingId, level, from: siteStatuses[sk], to: value, by: 'client' as const, at: new Date().toISOString(),
    }];
    await fetch('/api/transaction-dockets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docketId: docket.docketId, updates: { siteStatuses: updated, statusHistory: history, updatedAt: new Date().toISOString() } }),
    });
    setSaving(null);
  };

  const level1Params = docket?.params.filter(p => p.level === 1).sort((a, b) => a.order - b.order) || [];
  const level2Params = docket?.params.filter(p => p.level === 2).sort((a, b) => a.order - b.order) || [];

  const selectedSites = sites.filter(s =>
    siteStatuses[`${s.listingId}__L1`] === 'Selected' || siteStatuses[`${s.listingId}__L2`] === 'Selected');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(259 30% 96%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #6141ac', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: '#6141ac' }}>Loading proposal...</p>
      </div>
    </div>
  );

  if (invalid) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(259 30% 96%)' }}>
      <div style={{ textAlign: 'center', maxWidth: 340, padding: '0 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldCheck style={{ width: 28, height: 28, color: '#6141ac' }} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 18, color: '#1e1537', marginBottom: 8 }}>Link invalid or expired</p>
        <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>This proposal link is invalid or has been deactivated. Please contact the person who shared it.</p>
        <Button asChild style={{ marginTop: 20, background: '#6141ac' }}><Link href="/">Go to ORS-ONE</Link></Button>
      </div>
    </div>
  );

  if (!docket) return null;

  const flagCount = (listingId: string) =>
    Object.entries(docket.cellFlags || {}).filter(([k, v]) => k.includes(`__${listingId}`) && v).length;

  const cellKey = (paramId: string, listingId: string) => `${paramId}__${listingId}`;

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', border: '0.5px solid hsl(259 30% 92%)',
    verticalAlign: 'top', fontSize: 13, minWidth: 160,
  };
  const rowLabelStyle: React.CSSProperties = {
    padding: '10px 12px', border: '0.5px solid hsl(259 30% 92%)',
    fontSize: 12, color: 'hsl(259 15% 45%)', background: 'hsl(259 30% 98%)',
    whiteSpace: 'nowrap', position: 'sticky', left: 0, minWidth: 180,
  };
  const groupHeaderStyle: React.CSSProperties = {
    padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#6141ac',
    textTransform: 'uppercase', letterSpacing: '.06em',
    background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 30% 90%)',
    position: 'sticky', left: 0,
  };

  const renderLevel = (paramsList: typeof level1Params, level: 1 | 2) => {
    const groups: Record<string, typeof level1Params> = {};
    paramsList.forEach(p => { (groups[p.groupLabel] = groups[p.groupLabel] || []).push(p); });
    return Object.entries(groups).flatMap(([groupLabel, groupParams]) => [
      <tr key={`g-${level}-${groupLabel}`}>
        <td colSpan={sites.length + 1} style={groupHeaderStyle}>Level {level} — {groupLabel}</td>
      </tr>,
      ...groupParams.map(param => (
        <tr key={param.paramId}>
          <td style={rowLabelStyle}>{param.label}</td>
          {sites.map(site => {
            const key = cellKey(param.paramId, site.listingId);
            const flag = (docket.cellFlags || {})[key];
            return (
              <td key={site.listingId} style={{ ...tdStyle, background: flag === 'red' ? '#fee2e2' : flag === 'yellow' ? '#fef9c3' : '#fff' }}>
                {flag && <span style={{ fontSize: 10, marginBottom: 4, display: 'block' }}>{flag === 'red' ? '🚩 Risk flagged' : '⚠ Note flagged'}</span>}
                <div style={{ lineHeight: 1.6 }}>
                  {(docket.cellData || {})[key]
                    ? renderRichText((docket.cellData || {})[key])
                    : <span style={{ color: 'hsl(259 15% 70%)' }}>—</span>}
                </div>
              </td>
            );
          })}
        </tr>
      )),
      <tr key={`status-${level}`} style={{ background: 'hsl(259 44% 97%)' }}>
        <td style={{ ...rowLabelStyle, fontWeight: 600, color: '#1e1537' }}>
          Your preference — Level {level}
          <p style={{ fontWeight: 400, fontSize: 10, color: 'hsl(259 15% 60%)', marginTop: 2 }}>Select your preference below</p>
        </td>
        {sites.map(site => {
          const sk = `${site.listingId}__L${level}`;
          const current = siteStatuses[sk] || 'Not Decided';
          return (
            <td key={site.listingId} style={{ ...tdStyle, background: 'hsl(259 44% 97%)' }}>
              <select
                value={current}
                onChange={e => changeStatus(site.listingId, level, e.target.value)}
                disabled={saving === sk}
                style={{
                  fontSize: 12, width: '100%', border: '0.5px solid hsl(259 30% 82%)', borderRadius: 6, padding: '6px 8px',
                  background: '#fff', cursor: 'pointer',
                  color: current === 'Selected' ? '#166534' : current === 'Rejected' ? '#b91c1c' : '#1e1537',
                  fontWeight: current === 'Selected' ? 700 : 400,
                }}>
                {SITE_STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              {saving === sk && <p style={{ fontSize: 10, color: '#6141ac', marginTop: 3 }}>Saving…</p>}
            </td>
          );
        })}
      </tr>,
    ]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid hsl(259 30% 90%)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e1537' }}>ORS-ONE</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'hsl(259 44% 94%)', color: '#6141ac' }}>Proposal</span>
        </div>
        <Button asChild size="sm" style={{ background: '#6141ac' }}>
          <Link href="/signup">Create account <ArrowRight style={{ width: 12, height: 12, marginLeft: 4 }} /></Link>
        </Button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Docket header */}
        <div style={{ background: 'linear-gradient(135deg,#1e1537,#3b2870)', borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Warehouse Comparison Proposal</p>
          <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>{docket.title}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Prepared for {docket.clientName}{docket.clientCompany ? ` · ${docket.clientCompany}` : ''} · {sites.length} site{sites.length !== 1 ? 's' : ''} shortlisted
          </p>
        </div>

        {/* Selected site CTA */}
        {selectedSites.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>
                {selectedSites.length === 1 ? "You've selected a site" : `You've selected ${selectedSites.length} sites`}
              </p>
              <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>
                {selectedSites.map(s => s.location || s.listingId).join(', ')} · Ready to register the deal?
              </p>
            </div>
            <Button asChild style={{ background: '#166534', flexShrink: 0 }}>
              <Link href="/register-deal">Register a Deal <ArrowRight style={{ width: 14, height: 14, marginLeft: 4 }} /></Link>
            </Button>
          </div>
        )}

        {/* Instruction banner */}
        <div style={{ background: 'hsl(259 44% 96%)', border: '1px solid hsl(259 44% 86%)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#6141ac' }}>
          <strong>How to use this proposal:</strong> Review the comparison table below. Use the "Your preference" dropdowns to indicate your preference for each site at each stage. Your choices are saved automatically and shared with the ORS-ONE team in real time.
        </div>

        {/* Comparison table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', overflow: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 12px', background: 'hsl(259 30% 97%)', border: '0.5px solid hsl(259 30% 88%)', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'hsl(259 15% 55%)', position: 'sticky', left: 0, minWidth: 180 }}>
                  Parameter
                </th>
                {sites.map(site => {
                  const fc = flagCount(site.listingId);
                  return (
                    <th key={site.listingId} style={{ padding: '12px 12px', background: 'hsl(259 30% 97%)', border: '0.5px solid hsl(259 30% 88%)', textAlign: 'left', minWidth: 180 }}>
                      <p style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1e1537', margin: 0 }}>{site.listingId}</p>
                      <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: '2px 0 0' }}>{site.location}</p>
                      {fc > 0 && <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>{fc} flag{fc > 1 ? 's' : ''}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {renderLevel(level1Params, 1)}
              {renderLevel(level2Params, 2)}
            </tbody>
          </table>
        </div>

        {/* Contacts */}
        {(docket.contacts?.accountOwner?.name || docket.contacts?.transactionPartner?.name) && (
          <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', padding: '16px 20px' }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#1e1537', marginBottom: 12 }}>Your ORS-ONE team</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[docket.contacts.accountOwner, docket.contacts.transactionPartner].filter(Boolean).map((c, i) => (
                <div key={i} style={{ fontSize: 12 }}>
                  <p style={{ fontWeight: 600, color: '#1e1537', margin: 0 }}>{c?.name}</p>
                  <p style={{ color: 'hsl(259 15% 55%)', margin: '2px 0 0' }}>{c?.representing}</p>
                  {c?.email && <p style={{ color: '#6141ac', margin: '2px 0 0' }}>{c.email}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'hsl(259 15% 60%)', marginTop: 32 }}>
          Powered by ORS-ONE — Lakshmi Balaji Realty · orsone.app<br />
          This proposal is confidential and prepared exclusively for {docket.clientName}.
        </p>
      </div>
    </div>
  );
}
