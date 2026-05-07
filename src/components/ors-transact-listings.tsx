'use client';
import * as React from 'react';
import { Search, X, ChevronLeft, ChevronRight, MessageCircle, CheckSquare, Square, Send } from 'lucide-react';
import { OrsTransactCard } from './ors-transact-card';
import { useAuth } from '@/contexts/auth-context';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';

const FACILITY_TYPES = ['Warehouse', 'Industrial Building', 'VLR-Vacant Land Rental', 'Commercial Property'];

const SIZE_RANGES = [
  { label: 'Up to 4,999 sft',        min: 0,      max: 4999 },
  { label: '5,000 – 9,999 sft',      min: 5000,   max: 9999 },
  { label: '10,000 – 14,999 sft',    min: 10000,  max: 14999 },
  { label: '15,000 – 19,999 sft',    min: 15000,  max: 19999 },
  { label: '20,000 – 29,999 sft',    min: 20000,  max: 29999 },
  { label: '30,000 – 39,999 sft',    min: 30000,  max: 39999 },
  { label: '40,000 – 49,999 sft',    min: 40000,  max: 49999 },
  { label: '50,000 – 99,999 sft',    min: 50000,  max: 99999 },
  { label: '1,00,000 – 1,99,999 sft',min: 100000, max: 199999 },
  { label: '2,00,000 sft and above', min: 200000, max: 9999999 },
];

// Build WhatsApp message for a listing
function buildWhatsAppUrl(listing: OrsTransactListing): string | null {
  // Try mobile first, then contact numbers
  const phone = (
    listing.for_site_visit_contact_persons_mobile ||
    listing.contact_number_as_advertised_1 ||
    listing.contact_number_as_advertised_2 ||
    listing.contact_number_as_advertised_3 ||
    listing.for_site_visit_contact_persons_site_phone ||
    ''
  ).toString().replace(/\D/g, '');

  if (!phone || phone.length < 7) return null;

  // Normalise Indian numbers — add 91 if needed
  const normalised = phone.startsWith('91') && phone.length === 12
    ? phone
    : phone.length === 10
      ? `91${phone}`
      : phone;

  const location = [listing.city_location, listing.district, listing.state].filter(Boolean).join(', ');
  const size = listing.lease_area_as_advertised_in_sq_ft
    ? `${Number(listing.lease_area_as_advertised_in_sq_ft).toLocaleString('en-IN')} sft`
    : listing.lease_area_range_in_sq_ft || '';

  const msg = `Hello,

We are ORS-ONE, a warehouse leasing platform. We have your property listed with us.

Property ID: ${listing.ors_property_id}
Location: ${location}
Size: ${size}

Could you please confirm the current status of this warehouse?

1. ✅ Available for lease
2. 🔒 Already leased out
3. ❌ I am not the owner of this warehouse

Please reply with the option number.

Team ORS-ONE
https://www.orsone.app/`;

  return `https://wa.me/${normalised}?text=${encodeURIComponent(msg)}`;
}

// WhatsApp bulk panel
function WhatsAppPanel({ selected, listings, onClose }: {
  selected: Set<string>;
  listings: OrsTransactListing[];
  onClose: () => void;
}) {
  const selectedListings = listings.filter(l => selected.has(l.id || l.ors_property_id));
  const withPhone = selectedListings.filter(l => buildWhatsAppUrl(l) !== null);
  const noPhone = selectedListings.filter(l => buildWhatsAppUrl(l) === null);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(30,21,55,0.5)' }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', borderTop: '2px solid #6141ac' }}>
        <div style={{ padding: '14px 18px', background: '#1e1537', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle style={{ width: 16, height: 16, color: '#25D366' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>WhatsApp Availability Check</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ padding: '16px 18px', maxHeight: '60vh', overflowY: 'auto' }}>
          <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: '0 0 14px' }}>
            {withPhone.length} of {selectedListings.length} selected listings have a phone number. Each link opens WhatsApp with a pre-filled message.
          </p>

          {withPhone.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#1e1537', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>Ready to send</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {withPhone.map(l => {
                  const url = buildWhatsAppUrl(l)!;
                  const phone = (l.for_site_visit_contact_persons_mobile || l.contact_number_as_advertised_1 || '').toString();
                  return (
                    <div key={l.ors_property_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 88%)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>{l.ors_property_id}</p>
                        <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {[l.city_location, l.district].filter(Boolean).join(', ')} · {phone}
                        </p>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        <MessageCircle style={{ width: 11, height: 11 }} /> Send
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {noPhone.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'hsl(259 15% 55%)', letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>No phone number on record</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {noPhone.map(l => (
                  <div key={l.ors_property_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'hsl(0 0% 97%)', border: '0.5px solid hsl(0 0% 88%)' }}>
                    <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>{l.ors_property_id} — {[l.city_location, l.district].filter(Boolean).join(', ')}</p>
                    <span style={{ fontSize: 10, color: '#dc2626', marginLeft: 'auto', flexShrink: 0 }}>No number</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 18px', borderTop: '0.5px solid hsl(259 30% 88%)', display: 'flex', gap: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '9px', fontSize: 12, fontWeight: 600, color: '#6141ac', background: 'hsl(259 44% 94%)', border: '0.5px solid hsl(259 44% 80%)', cursor: 'pointer', borderRadius: 0 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrsTransactListings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const isPrivilegedStaff = (user as any)?.isInternalStaff &&
    ((user as any)?.privileges?.includes('ors_transact_contacts') ||
     (user as any)?.privileges?.includes('ors_transact_full'));
  const canWhatsApp = isAdmin || isPrivilegedStaff;

  const sessionSeed = React.useRef(Math.floor(Math.random() * 2147483647));
  const [listings, setListings] = React.useState<OrsTransactListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(9420);

  // Filters
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [facilityType, setFacilityType] = React.useState('');
  const [state, setState] = React.useState('');
  const [locality, setLocality] = React.useState('');
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]); // multi-select
  const [showSizeDropdown, setShowSizeDropdown] = React.useState(false);

  // WhatsApp selection
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [showWA, setShowWA] = React.useState(false);

  const [states, setStates] = React.useState<string[]>([]);
  const [localities, setLocalities] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch('/api/ors-transact?meta=states').then(r => r.json()).then(d => setStates(d.states || [])).catch(() => {});
  }, []);

  React.useEffect(() => {
    setLocality('');
    if (!state) { setLocalities([]); return; }
    fetch(`/api/ors-transact?meta=localities&state=${encodeURIComponent(state)}`)
      .then(r => r.json()).then(d => setLocalities(d.localities || [])).catch(() => {});
  }, [state]);

  const buildParams = (p: number) => {
    const params = new URLSearchParams({ page: String(p), seed: String(sessionSeed.current) });
    if (facilityType) params.set('facilityType', facilityType);
    if (state) params.set('state', state);
    if (locality) params.set('locality', locality);
    if (search) params.set('search', search);
    // Multi-size: send as multiple sizeRange params, API handles OR logic
    if (selectedSizes.length > 0) {
      // Compute combined min/max across all selected ranges
      const ranges = selectedSizes.map(k => SIZE_RANGES.find(r => `${r.min}-${r.max}` === k)!).filter(Boolean);
      const minVal = Math.min(...ranges.map(r => r.min));
      const maxVal = Math.max(...ranges.map(r => r.max));
      params.set('sizeMin', String(minVal));
      params.set('sizeMax', String(maxVal));
      params.set('sizeRanges', selectedSizes.join(','));
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
      const hasActive = !!(facilityType || state || locality || selectedSizes.length || search);
      setTotal(hasActive ? (data.total || 0) : 9420);
      setTotalPages(Math.max(1, Math.ceil((hasActive ? (data.total || 0) : 9420) / 24)));
      setPage(p);
    } catch {}
    setLoading(false);
  }, [facilityType, state, locality, selectedSizes.join(','), search]);

  React.useEffect(() => { load(1); }, [facilityType, state, locality, selectedSizes.join(','), search]);

  const toggleSize = (key: string) => {
    setSelectedSizes(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (selected.size === listings.length) setSelected(new Set());
    else setSelected(new Set(listings.map(l => l.id || l.ors_property_id)));
  };

  const commitSearch = () => setSearch(searchInput);
  const clearAll = () => {
    setSearchInput(''); setSearch(''); setFacilityType('');
    setState(''); setLocality(''); setSelectedSizes([]); setSelected(new Set());
  };
  const activeFilters = [facilityType, state, locality, search].filter(Boolean).length + selectedSizes.length;

  const sizeLabel = selectedSizes.length === 0
    ? 'All sizes'
    : selectedSizes.length === 1
      ? SIZE_RANGES.find(r => `${r.min}-${r.max}` === selectedSizes[0])?.label || '1 range'
      : `${selectedSizes.length} ranges selected`;

  const pageNumbers = React.useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const btnStyle = (active: boolean, disabled = false): React.CSSProperties => ({
    padding: '6px 10px', fontSize: 12, fontWeight: active ? 600 : 400,
    background: active ? '#6141ac' : 'var(--color-background-primary)',
    color: active ? '#fff' : disabled ? 'hsl(259 15% 70%)' : 'var(--color-text-primary)',
    border: `0.5px solid ${active ? '#6141ac' : 'hsl(259 30% 85%)'}`,
    cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 0, minWidth: 34,
  });

  // Close size dropdown on outside click
  const sizeRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setShowSizeDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>ORS Transact Listings</h2>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: 0 }}>Warehouse and industrial properties transacted directly through ORS-ONE.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {canWhatsApp && selected.size > 0 && (
              <button onClick={() => setShowWA(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                <MessageCircle style={{ width: 13, height: 13 }} /> WhatsApp ({selected.size})
              </button>
            )}
            <span style={{ fontSize: 12, color: 'hsl(259 15% 55%)', flexShrink: 0 }}>
              {loading ? '—' : `${total.toLocaleString()} listings`}
            </span>
          </div>
        </div>
      </div>

      {/* Search row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', padding: '7px 10px' }}>
          <Search style={{ width: 13, height: 13, color: 'hsl(259 15% 55%)', flexShrink: 0 }} />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitSearch()} onBlur={commitSearch}
            placeholder="Search city, district, locality, ORS ID..."
            style={{ flex: 1, fontSize: 12, outline: 'none', background: 'transparent', color: 'var(--color-text-primary)', border: 'none' }} />
          {searchInput && <button onClick={() => { setSearchInput(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(259 15% 55%)', padding: 0 }}><X style={{ width: 12, height: 12 }} /></button>}
        </div>
        {activeFilters > 0 && (
          <button onClick={clearAll} style={{ fontSize: 11, color: 'hsl(259 15% 50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '0 6px' }}>
            <X style={{ width: 11, height: 11 }} /> Clear all ({activeFilters})
          </button>
        )}
      </div>

      {/* Filter row */}
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

        {/* Multi-select size dropdown */}
        <div ref={sizeRef} style={{ position: 'relative', width: '100%' }}>
          <button onClick={() => setShowSizeDropdown(v => !v)}
            style={{ width: '100%', textAlign: 'left', fontSize: 12, padding: '7px 10px', border: `0.5px solid ${selectedSizes.length ? '#6141ac' : 'hsl(259 30% 85%)'}`, background: 'var(--color-background-primary)', color: selectedSizes.length ? '#6141ac' : 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0, fontWeight: selectedSizes.length ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sizeLabel}</span>
            <span style={{ fontSize: 9, flexShrink: 0 }}>▾</span>
          </button>
          {showSizeDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '0.5px solid hsl(259 30% 85%)', zIndex: 20, minWidth: 200 }}>
              <div style={{ padding: '4px 0', maxHeight: 280, overflowY: 'auto' }}>
                {SIZE_RANGES.map(r => {
                  const key = `${r.min}-${r.max}`;
                  const checked = selectedSizes.includes(key);
                  return (
                    <button key={key} onClick={() => toggleSize(key)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: checked ? 'hsl(259 44% 96%)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, color: checked ? '#6141ac' : 'var(--color-text-primary)', fontWeight: checked ? 600 : 400 }}>
                      {checked
                        ? <CheckSquare style={{ width: 13, height: 13, color: '#6141ac', flexShrink: 0 }} />
                        : <Square style={{ width: 13, height: 13, color: 'hsl(259 15% 65%)', flexShrink: 0 }} />}
                      {r.label}
                    </button>
                  );
                })}
              </div>
              {selectedSizes.length > 0 && (
                <button onClick={() => setSelectedSizes([])}
                  style={{ width: '100%', padding: '6px', fontSize: 11, color: 'hsl(259 15% 50%)', background: 'hsl(259 30% 96%)', border: 'none', borderTop: '0.5px solid hsl(259 30% 88%)', cursor: 'pointer' }}>
                  Clear sizes
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin: select all bar */}
      {canWhatsApp && !loading && listings.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 88%)', marginBottom: 10 }}>
          <button onClick={toggleSelectAll}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: '#6141ac', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {selected.size === listings.length
              ? <CheckSquare style={{ width: 13, height: 13 }} />
              : <Square style={{ width: 13, height: 13 }} />}
            {selected.size === listings.length ? 'Deselect all' : `Select all ${listings.length} on page`}
          </button>
          {selected.size > 0 && (
            <>
              <span style={{ fontSize: 11, color: 'hsl(259 15% 55%)' }}>{selected.size} selected</span>
              <button onClick={() => setShowWA(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', padding: '5px 12px', background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 0, fontSize: 11, fontWeight: 700 }}>
                <MessageCircle style={{ width: 12, height: 12 }} /> WhatsApp Selected
              </button>
            </>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 90%)', height: 200 }} />
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
            {listings.map(l => {
              const id = l.id || l.ors_property_id;
              return (
                <div key={id} style={{ position: 'relative' }}>
                  {/* Admin select checkbox */}
                  {canWhatsApp && (
                    <button onClick={() => toggleSelect(id)}
                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: selected.has(id) ? '#6141ac' : '#fff', border: `0.5px solid ${selected.has(id) ? '#6141ac' : 'hsl(259 30% 82%)'}`, cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selected.has(id)
                        ? <CheckSquare style={{ width: 14, height: 14, color: '#fff' }} />
                        : <Square style={{ width: 14, height: 14, color: 'hsl(259 15% 55%)' }} />}
                    </button>
                  )}
                  <OrsTransactCard listing={l} />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8, borderTop: '0.5px solid hsl(259 30% 90%)', flexWrap: 'wrap' }}>
              <button onClick={() => load(page - 1)} disabled={page === 1} style={btnStyle(false, page === 1)}>
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              {pageNumbers.map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} style={{ padding: '6px 4px', fontSize: 12, color: 'hsl(259 15% 55%)' }}>…</span>
                  : <button key={p} onClick={() => load(p as number)} style={btnStyle(p === page)}>{p}</button>
              )}
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

      {/* WhatsApp panel */}
      {showWA && <WhatsAppPanel selected={selected} listings={listings} onClose={() => setShowWA(false)} />}
    </div>
  );
}
