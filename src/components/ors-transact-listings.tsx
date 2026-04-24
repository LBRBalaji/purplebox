'use client';
import * as React from 'react';
import { Search, X } from 'lucide-react';
import { OrsTransactCard } from './ors-transact-card';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';

const FACILITY_TYPES = ['Warehouse', 'Industrial Building', 'VLR-Vacant Land Rental', 'Commercial Property'];
const SIZE_RANGES = [
  { label: 'Up to 5,000 sft', min: 0, max: 5000 },
  { label: '5,001 – 20,000 sft', min: 5001, max: 20000 },
  { label: '20,001 – 50,000 sft', min: 20001, max: 50000 },
  { label: '50,001 – 1,00,000 sft', min: 50001, max: 100000 },
  { label: 'Above 1,00,000 sft', min: 100001, max: 9999999 },
];

export function OrsTransactListings() {
  const [listings, setListings] = React.useState<OrsTransactListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [facilityType, setFacilityType] = React.useState('');
  const [sizeRange, setSizeRange] = React.useState('');
  const [state, setState] = React.useState('');
  const [states, setStates] = React.useState<string[]>([]);

  const buildParams = (cur?: string | null) => {
    const p = new URLSearchParams();
    if (facilityType) p.set('facilityType', facilityType);
    if (state) p.set('state', state);
    if (sizeRange) {
      const r = SIZE_RANGES.find(x => `${x.min}-${x.max}` === sizeRange);
      if (r) { p.set('sizeMin', String(r.min)); p.set('sizeMax', String(r.max)); }
    }
    if (cur) p.set('cursor', cur);
    return p.toString();
  };

  const load = React.useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ors-transact?${buildParams(reset ? null : cursor)}`);
      const data = await res.json();
      const raw: OrsTransactListing[] = data.listings || [];

      // Client-side search
      const filtered = search.trim()
        ? raw.filter(l => [l.ors_property_id, l.city_location, l.district, l.state, l.locality_circle, l.facility_type]
            .some(v => v?.toLowerCase().includes(search.toLowerCase())))
        : raw;

      if (reset) {
        setListings(filtered);
        // Build state list from first batch
        const stateSet = new Set<string>(raw.map(l => l.state).filter(Boolean));
        if (stateSet.size) setStates(Array.from(stateSet).sort());
      } else {
        setListings(prev => [...prev, ...filtered]);
      }
      setCursor(data.nextCursor || null);
      setHasMore(raw.length === 50);
    } catch { setHasMore(false); }
    setLoading(false);
  }, [facilityType, state, sizeRange, cursor, search]);

  React.useEffect(() => { load(true); }, [facilityType, state, sizeRange]);

  const activeFilters = [facilityType, state, sizeRange].filter(Boolean).length;

  return (
    <div>
      {/* Section intro */}
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>ORS Transact Listings</h2>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: 0 }}>
              Warehouse and industrial properties transacted directly through ORS-ONE. Contact ORS to confirm availability and proceed.
            </p>
          </div>
          {!loading && (
            <span style={{ fontSize: 12, color: 'hsl(259 15% 55%)', flexShrink: 0 }}>
              {listings.length.toLocaleString()} listings
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Search */}
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', padding: '7px 10px' }}>
          <Search style={{ width: 13, height: 13, color: 'hsl(259 15% 55%)', flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(true)}
            placeholder="Search city, district, ORS ID..."
            style={{ flex: 1, fontSize: 12, outline: 'none', background: 'transparent', color: 'var(--color-text-primary)', border: 'none' }} />
          {search && (
            <button onClick={() => { setSearch(''); load(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(259 15% 55%)', padding: 0, lineHeight: 1 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>

        {/* Facility type */}
        <select value={facilityType} onChange={e => setFacilityType(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0 }}>
          <option value="">All facility types</option>
          {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        {/* State */}
        <select value={state} onChange={e => setState(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0 }}>
          <option value="">All states</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Size range */}
        <select value={sizeRange} onChange={e => setSizeRange(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0 }}>
          <option value="">All sizes</option>
          {SIZE_RANGES.map(r => <option key={`${r.min}-${r.max}`} value={`${r.min}-${r.max}`}>{r.label}</option>)}
        </select>

        {activeFilters > 0 && (
          <button onClick={() => { setFacilityType(''); setState(''); setSizeRange(''); setSearch(''); }}
            style={{ fontSize: 11, color: 'hsl(259 15% 50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '0 4px' }}>
            <X style={{ width: 11, height: 11 }} /> Clear ({activeFilters})
          </button>
        )}
      </div>

      {/* Grid */}
      {loading && listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'hsl(259 15% 55%)' }}>
          <p style={{ fontSize: 13 }}>Loading ORS Transact listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 88%)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>No listings match your filters</p>
          <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>Try adjusting the filters above</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {listings.map(l => <OrsTransactCard key={l.id || l.ors_property_id} listing={l} />)}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => load(false)} disabled={loading}
                style={{ padding: '9px 28px', background: 'hsl(259 44% 94%)', color: '#6141ac', fontSize: 12, fontWeight: 600, border: '0.5px solid hsl(259 44% 80%)', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 0 }}>
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
