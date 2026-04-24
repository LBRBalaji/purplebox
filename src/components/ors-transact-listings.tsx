'use client';
import * as React from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Session seed — generated once per page load, stable while browsing, different every visit

export function OrsTransactListings() {
  // Session seed: random on mount, never changes during the session
  const sessionSeed = React.useRef(Math.floor(Math.random() * 2147483647));
  const [listings, setListings] = React.useState<OrsTransactListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(9420); // static known value, API confirms

  // Filters
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState(''); // controlled input, committed on Enter/blur
  const [facilityType, setFacilityType] = React.useState('');
  const [state, setState] = React.useState('');
  const [locality, setLocality] = React.useState('');
  const [sizeRange, setSizeRange] = React.useState('');

  // Dropdown options — loaded once
  const [states, setStates] = React.useState<string[]>([]);
  const [localities, setLocalities] = React.useState<string[]>([]);

  // Load states on mount
  React.useEffect(() => {
    fetch('/api/ors-transact?meta=states')
      .then(r => r.json())
      .then(d => setStates(d.states || []))
      .catch(() => {});
  }, []);

  // Load localities when state changes
  React.useEffect(() => {
    setLocality('');
    if (!state) { setLocalities([]); return; }
    fetch(`/api/ors-transact?meta=localities&state=${encodeURIComponent(state)}`)
      .then(r => r.json())
      .then(d => setLocalities(d.localities || []))
      .catch(() => {});
  }, [state]);

  const buildParams = (p: number) => {
    const params = new URLSearchParams({ page: String(p), seed: String(sessionSeed.current) });
    if (facilityType) params.set('facilityType', facilityType);
    if (state) params.set('state', state);
    if (locality) params.set('locality', locality);
    if (search) params.set('search', search);
    if (sizeRange) {
      const r = SIZE_RANGES.find(x => `${x.min}-${x.max}` === sizeRange);
      if (r) { params.set('sizeMin', String(r.min)); params.set('sizeMax', String(r.max)); }
    }
    return params.toString();
  };

  const load = React.useCallback(async (p: number) => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await fetch(`/api/ors-transact?${buildParams(p)}`);
      const data = await res.json();
      setListings(data.listings || []);
      // When no filters: always show full collection count (9420)
      // When filters active: show filtered count from API
      const hasActiveFilters = !!(facilityType || state || locality || sizeRange || search);
      setTotal(hasActiveFilters ? (data.total || 0) : 9420);
      // Pages: when unfiltered use full count for page calculation
      const countForPages = hasActiveFilters ? (data.total || 0) : 9420;
      setTotalPages(Math.max(1, Math.ceil(countForPages / 24)));
      setPage(p);
    } catch {}
    setLoading(false);
  }, [facilityType, state, locality, sizeRange, search]);

  // Reload page 1 when any filter changes
  React.useEffect(() => { load(1); }, [facilityType, state, locality, sizeRange, search]);

  const commitSearch = () => { setSearch(searchInput); };
  const clearAll = () => {
    setSearchInput(''); setSearch(''); setFacilityType('');
    setState(''); setLocality(''); setSizeRange('');
  };
  const activeFilters = [facilityType, state, locality, sizeRange, search].filter(Boolean).length;

  // Pagination pages to show
  const pageNumbers = React.useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const btnStyle = (active: boolean, disabled = false): React.CSSProperties => ({
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    background: active ? '#6141ac' : 'var(--color-background-primary)',
    color: active ? '#fff' : disabled ? 'hsl(259 15% 70%)' : 'var(--color-text-primary)',
    border: `0.5px solid ${active ? '#6141ac' : 'hsl(259 30% 85%)'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 0,
    minWidth: 34,
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>ORS Transact Listings</h2>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: 0 }}>
              Warehouse and industrial properties transacted directly through ORS-ONE.
            </p>
          </div>
          <span style={{ fontSize: 12, color: 'hsl(259 15% 55%)', flexShrink: 0 }}>
            {loading ? '—' : `${total.toLocaleString()} listings`}
          </span>
        </div>
      </div>

      {/* Filters — row 1: search + clear */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', padding: '7px 10px' }}>
          <Search style={{ width: 13, height: 13, color: 'hsl(259 15% 55%)', flexShrink: 0 }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitSearch()}
            onBlur={commitSearch}
            placeholder="Search city, district, locality, ORS ID..."
            style={{ flex: 1, fontSize: 12, outline: 'none', background: 'transparent', color: 'var(--color-text-primary)', border: 'none' }} />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(259 15% 55%)', padding: 0 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
        {activeFilters > 0 && (
          <button onClick={clearAll} style={{ fontSize: 11, color: 'hsl(259 15% 50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '0 6px' }}>
            <X style={{ width: 11, height: 11 }} /> Clear all ({activeFilters})
          </button>
        )}
      </div>

      {/* Filters — row 2: dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 16 }}>
        <select value={facilityType} onChange={e => setFacilityType(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0, width: '100%' }}>
          <option value="">All facility types</option>
          {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        <select value={state} onChange={e => setState(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0, width: '100%' }}>
          <option value="">All states</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>

        <select value={locality} onChange={e => setLocality(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: `0.5px solid ${locality ? '#6141ac' : 'hsl(259 30% 85%)'}`, background: 'var(--color-background-primary)', color: locality ? '#6141ac' : 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0, fontWeight: locality ? 600 : 400, width: '100%' }}>
          <option value="">Locality Circle</option>
          {localities.map(l => <option key={l}>{l}</option>)}
        </select>

        <select value={sizeRange} onChange={e => setSizeRange(e.target.value)}
          style={{ fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0, width: '100%' }}>
          <option value="">All sizes</option>
          {SIZE_RANGES.map(r => <option key={`${r.min}-${r.max}`} value={`${r.min}-${r.max}`}>{r.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 90%)', height: 200, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 88%)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>No listings match your filters</p>
          <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>Try adjusting the filters or clear search</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
            {listings.map(l => <OrsTransactCard key={l.id || l.ors_property_id} listing={l} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8, borderTop: '0.5px solid hsl(259 30% 90%)', flexWrap: 'wrap' }}>
              {/* Prev */}
              <button onClick={() => load(page - 1)} disabled={page === 1} style={btnStyle(false, page === 1)}>
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>

              {pageNumbers.map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} style={{ padding: '6px 4px', fontSize: 12, color: 'hsl(259 15% 55%)' }}>…</span>
                  : <button key={p} onClick={() => load(p as number)} style={btnStyle(p === page)}>{p}</button>
              )}

              {/* Next */}
              <button onClick={() => load(page + 1)} disabled={page === totalPages} style={btnStyle(false, page === totalPages)}>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>

              <span style={{ fontSize: 11, color: 'hsl(259 15% 55%)', marginLeft: 4, textAlign: 'center', width: '100%', marginTop: 4 }}>
                Page {page} of {totalPages.toLocaleString()} · {total.toLocaleString()} listings
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
