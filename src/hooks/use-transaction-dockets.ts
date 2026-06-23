'use client';
import * as React from 'react';
import type { TransactionDocket, DocketParam, DocketTask, ListingSchema } from '@/lib/schema';

const POSSESSION_OPTIONS = [
  'Ready To Occupy', 'In 1 Month', 'In 3 Months', 'Under Construction', 'BTS - Built To Suit',
];

export { POSSESSION_OPTIONS };

// Default Level 1 and Level 2 comparison parameters seeded into every new docket.
// Level 1 has two sections: Preliminary Information + Lease Terms.
// Level 2 covers Owner meeting, terms & legal (filled after first meeting).
export const DEFAULT_DOCKET_PARAMS: DocketParam[] = [
  // ── Level 1 › Preliminary Information ────────────────────────────────────
  { paramId: 'L1_distance',  label: 'Distance From Client Location-if any',              groupLabel: 'Preliminary Information', level: 1, order: 0 },
  { paramId: 'L1_access',    label: 'Approach Road Access for 40 Feet Container Movement', groupLabel: 'Preliminary Information', level: 1, order: 1 },
  { paramId: 'L1_type',      label: 'Warehouse type',                                    groupLabel: 'Preliminary Information', level: 1, order: 2 },
  { paramId: 'L1_area',      label: 'Leasable Area (SFT)',                                groupLabel: 'Preliminary Information', level: 1, order: 3 },
  { paramId: 'L1_height',    label: 'Clear height / Eve height',                          groupLabel: 'Preliminary Information', level: 1, order: 4 },
  { paramId: 'L1_docks',     label: 'Docks Ratio',                                        groupLabel: 'Preliminary Information', level: 1, order: 5 },
  { paramId: 'L1_fire',      label: 'Fire safety / NOC status',                           groupLabel: 'Preliminary Information', level: 1, order: 6 },

  // ── Level 1 › Lease Terms ─────────────────────────────────────────────────
  { paramId: 'L1_possession',     label: 'Warehouse Possession',                      groupLabel: 'Lease Terms', level: 1, order: 7,
    paramType: 'dropdown', dropdownOptions: POSSESSION_OPTIONS },
  { paramId: 'L1_quoted_rent',    label: 'Quoted Rent (Per SFT/Per Month)',           groupLabel: 'Lease Terms', level: 1, order: 8 },
  { paramId: 'L1_security_deposit', label: 'Rental Security Deposit (Number of Months)', groupLabel: 'Lease Terms', level: 1, order: 9 },
  { paramId: 'L1_rental_escalation', label: 'Rental Escalation',                     groupLabel: 'Lease Terms', level: 1, order: 10 },

  // ── Level 2 › Owner meeting & terms ──────────────────────────────────────
  { paramId: 'L2_meeting',    label: 'Meeting status with owner',     groupLabel: 'Owner meeting & terms', level: 2, order: 0 },
  { paramId: 'L2_occupancy',  label: 'Current occupancy',             groupLabel: 'Owner meeting & terms', level: 2, order: 1 },
  { paramId: 'L2_rent',       label: 'Lease rate quoted (₹/sft)',    groupLabel: 'Owner meeting & terms', level: 2, order: 2 },
  { paramId: 'L2_lockin',     label: 'Lock-in period',                groupLabel: 'Owner meeting & terms', level: 2, order: 3 },
  { paramId: 'L2_deposit',    label: 'Security deposit',              groupLabel: 'Owner meeting & terms', level: 2, order: 4 },
  { paramId: 'L2_escalation', label: 'Escalation %',                  groupLabel: 'Owner meeting & terms', level: 2, order: 5 },

  // ── Level 2 › Legal findings ──────────────────────────────────────────────
  { paramId: 'L2_title',     label: 'Title clarity',                  groupLabel: 'Legal findings', level: 2, order: 6 },
  { paramId: 'L2_approvals', label: 'Approvals / factory license',    groupLabel: 'Legal findings', level: 2, order: 7 },
  { paramId: 'L2_disputes',  label: 'Ownership disputes',             groupLabel: 'Legal findings', level: 2, order: 8 },
];

export const SITE_STATUS_OPTIONS = [
  'Not Decided', 'Shortlisted', 'Under Evaluation', 'On Hold', 'Selected', 'Rejected',
];

// Auto-fill Level 1 cells from a listing's stored data when docket is created
export function autoFillCellsFromListing(listing: ListingSchema, paramIds: string[]): Record<string, string> {
  const cells: Record<string, string> = {};
  const key = (p: string) => `${p}__${listing.listingId}`;
  if (paramIds.includes('L1_type') && listing.warehouseModel)
    cells[key('L1_type')] = listing.warehouseModel;
  // Leasable Area: show min–max range if partition details exist, else total size
  if (paramIds.includes('L1_area')) {
    const min = listing.offeredSizeMin;
    const max = listing.offeredSizeMax;
    const total = listing.sizeSqFt;
    if (min && max)
      cells[key('L1_area')] = `${min.toLocaleString('en-IN')} – ${max.toLocaleString('en-IN')} sft`;
    else if (max)
      cells[key('L1_area')] = `${max.toLocaleString('en-IN')} sft`;
    else if (total)
      cells[key('L1_area')] = `${total.toLocaleString('en-IN')} sft`;
  }
  if (paramIds.includes('L1_height') && listing.buildingSpecifications?.eveHeightMeters)
    cells[key('L1_height')] = listing.buildingSpecifications.eveHeightMeters + ' m';
  if (paramIds.includes('L1_docks') && listing.buildingSpecifications?.numberOfDocksAndShutters)
    cells[key('L1_docks')] = String(listing.buildingSpecifications.numberOfDocksAndShutters);
  if (paramIds.includes('L1_fire'))
    cells[key('L1_fire')] = listing.certificatesAndApprovals?.fireNOC ? 'In place' : 'Pending';
  return cells;
}

// Lightweight rich-text renderer: **bold**, - bullet, 1. numbered
export function renderRichText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let bulletBuf: string[] = [];
  let numBuf: string[] = [];

  const flushBullets = () => {
    if (bulletBuf.length) {
      result.push(React.createElement('ul', { key: `ul${result.length}`, style: { paddingLeft: 16, margin: '2px 0' } },
        bulletBuf.map((t, i) => React.createElement('li', { key: i, style: { fontSize: 'inherit' } }, parseBold(t)))));
      bulletBuf = [];
    }
  };
  const flushNumbers = () => {
    if (numBuf.length) {
      result.push(React.createElement('ol', { key: `ol${result.length}`, style: { paddingLeft: 16, margin: '2px 0' } },
        numBuf.map((t, i) => React.createElement('li', { key: i, style: { fontSize: 'inherit' } }, parseBold(t)))));
      numBuf = [];
    }
  };
  const parseBold = (s: string): React.ReactNode => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
      ? React.createElement('strong', { key: i }, p.slice(2, -2)) : p);
  };

  for (const line of lines) {
    if (line.startsWith('- ')) { flushNumbers(); bulletBuf.push(line.slice(2)); }
    else if (/^\d+\.\s/.test(line)) { flushBullets(); numBuf.push(line.replace(/^\d+\.\s/, '')); }
    else { flushBullets(); flushNumbers(); if (line) result.push(React.createElement('p', { key: `p${result.length}`, style: { margin: '1px 0' } }, parseBold(line))); }
  }
  flushBullets(); flushNumbers();
  return result.length > 0 ? result : null;
}

export function useTransactionDockets() {
  const [dockets, setDockets] = React.useState<TransactionDocket[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDockets = React.useCallback(async () => {
    try {
      const res = await fetch('/api/transaction-dockets');
      const data = await res.json();
      setDockets(Array.isArray(data) ? data : []);
    } catch (e) { console.error('useTransactionDockets: fetch failed', e); }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDockets();
    const interval = setInterval(fetchDockets, 60000);
    return () => clearInterval(interval);
  }, [fetchDockets]);

  const createDocket = React.useCallback(async (newDocket: Omit<TransactionDocket, 'docketId'>) => {
    const res = await fetch('/api/transaction-dockets', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDocket }),
    });
    const result = await res.json();
    await fetchDockets();
    return result.docketId as string;
  }, [fetchDockets]);

  const updateDocket = React.useCallback(async (docketId: string, updates: Partial<TransactionDocket>) => {
    await fetch('/api/transaction-dockets', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docketId, updates }),
    });
    await fetchDockets();
  }, [fetchDockets]);

  const archiveDocket = React.useCallback(async (docketId: string) => {
    await updateDocket(docketId, { archived: true });
  }, [updateDocket]);

  return { dockets, isLoading, createDocket, updateDocket, archiveDocket, refetch: fetchDockets };
}
