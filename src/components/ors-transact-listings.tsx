'use client';
import * as React from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { OrsTransactCard, OrsTransactDetail } from './ors-transact-card';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';

const FACILITY_TYPES = ['Warehouse','Industrial Building','VLR-Vacant Land Rental','Commercial Property','Cold Storage','Manufacturing'];
const STATES = ['Tamilnadu','Karnataka','Andhra Pradesh','Telangana','Maharashtra','Gujarat'];
const SIZE_RANGES = [
  { label: 'Up to 5,000 sft', min: 0, max: 5000 },
  { label: '5,000 – 20,000 sft', min: 5000, max: 20000 },
  { label: '20,000 – 50,000 sft', min: 20000, max: 50000 },
  { label: '50,000 – 1,00,000 sft', min: 50000, max: 100000 },
  { label: 'Above 1,00,000 sft', min: 100000, max: 999999 },
];

export function OrsTransactListings() {
  const [listings, setListings] = React.useState<OrsTransactListing[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selected, setSelected] = React.useState<OrsTransactListing | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  // Filters
  const [search, setSearch] = React.useState('');
  const [facilityType, setFacilityType] = React.useState('');
  const [state, setState] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [mode, setMode] = React.useState(''); // '' | 'ors_transact' | 'dual'
  const [sizeRange, setSizeRange] = React.useState<{min:number;max:number}|null>(null);

  const fetchListings = React.useCallback(async (reset = false) => {
    setLoading(true);
    const p = reset ? 1 : page;
    const params = new URLSearchParams({
      page: String(p),
      ...(facilityType && { facilityType }),
      ...(state && { state }),
      ...(district && { district }),
      ...(mode && { mode }),
      ...(sizeRange && { sizeMin: String(sizeRange.min), sizeMax: String(sizeRange.max) }),
    });

    try {
      const res = await fetch(`/api/ors-transact?${params}`);
      const data = await res.json();
      const newListings: OrsTransactListing[] = data.listings || [];

      // Client-side search filter
      const filtered = search
        ? newListings.filter(l =>
            [l.city_location, l.district, l.state, l.locality_circle, l.facility_type, l.ors_property_id]
              .some(v => v?.toLowerCase().includes(search.toLowerCase()))
          )
        : newListings;

      if (reset) {
        setListings(filtered);
        setPage(2);
      } else {
        setListings(prev => [...prev, ...filtered]);
        setPage(p + 1);
      }
      setHasMore(newListings.length === 50);
    } catch { setHasMore(false); }
    setLoading(false);
  }, [page, facilityType, state, district, mode, sizeRange, search]);

  // Initial load
  React.useEffect(() => { fetchListings(true); }, [facilityType, state, district, mode, sizeRange]);

  const activeFilterCount = [facilityType, state, district, mode, sizeRange].filter(Boolean).length;

  return (
    <div>
      {/* Filter bar */}
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',marginBottom:16}}>
        <div style={{flex:1,minWidth:200,display:'flex',alignItems:'center',gap:8,background:'#fff',border:'0.5px solid hsl(160 30% 82%)',padding:'7px 12px'}}>
          <Search style={{width:14,height:14,color:'hsl(160 20% 55%)',flexShrink:0}} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchListings(true)}
            placeholder="Search by location, city, ORS ID..."
            style={{flex:1,fontSize:13,outline:'none',background:'transparent',color:'#1e1537',border:'none'}} />
        </div>

        {/* Mode filter */}
        <select value={mode} onChange={e => setMode(e.target.value)}
          style={{fontSize:12,padding:'7px 10px',border:'0.5px solid hsl(160 30% 82%)',background:'#fff',color:'#1e1537',cursor:'pointer'}}>
          <option value="">All Modes</option>
          <option value="ors_transact">ORS Transact Only</option>
          <option value="dual">Direct + ORS Transact</option>
        </select>

        {/* Facility type */}
        <select value={facilityType} onChange={e => setFacilityType(e.target.value)}
          style={{fontSize:12,padding:'7px 10px',border:'0.5px solid hsl(160 30% 82%)',background:'#fff',color:'#1e1537',cursor:'pointer'}}>
          <option value="">All Facility Types</option>
          {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>

        {/* State */}
        <select value={state} onChange={e => setState(e.target.value)}
          style={{fontSize:12,padding:'7px 10px',border:'0.5px solid hsl(160 30% 82%)',background:'#fff',color:'#1e1537',cursor:'pointer'}}>
          <option value="">All States</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Size range */}
        <select value={sizeRange ? `${sizeRange.min}-${sizeRange.max}` : ''}
          onChange={e => {
            const found = SIZE_RANGES.find(r => `${r.min}-${r.max}` === e.target.value);
            setSizeRange(found || null);
          }}
          style={{fontSize:12,padding:'7px 10px',border:'0.5px solid hsl(160 30% 82%)',background:'#fff',color:'#1e1537',cursor:'pointer'}}>
          <option value="">All Sizes</option>
          {SIZE_RANGES.map(r => <option key={`${r.min}-${r.max}`} value={`${r.min}-${r.max}`}>{r.label}</option>)}
        </select>

        {activeFilterCount > 0 && (
          <button onClick={() => { setFacilityType(''); setState(''); setDistrict(''); setMode(''); setSizeRange(null); setSearch(''); }}
            style={{fontSize:11,color:'hsl(160 20% 45%)',display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',padding:'6px 8px'}}>
            <X style={{width:12,height:12}} /> Clear ({activeFilterCount})
          </button>
        )}

        <p style={{fontSize:12,color:'hsl(160 20% 50%)',flexShrink:0}}>
          {listings.length.toLocaleString()} {listings.length === 1 ? 'listing' : 'listings'}
        </p>
      </div>

      {/* Grid */}
      {loading && listings.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px 0',color:'hsl(160 20% 55%)'}}>
          <p style={{fontSize:13}}>Loading ORS Transact listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px 0',background:'#fff',border:'0.5px solid hsl(160 30% 85%)'}}>
          <p style={{fontSize:14,fontWeight:600,color:'#1e1537',margin:'0 0 6px'}}>No listings match your filters</p>
          <p style={{fontSize:12,color:'hsl(160 20% 55%)'}}>Try adjusting the filters above</p>
        </div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {listings.map(l => (
              <OrsTransactCard key={l.id} listing={l} onClick={() => setSelected(l)} />
            ))}
          </div>

          {hasMore && (
            <div style={{textAlign:'center',marginTop:24}}>
              <button onClick={() => fetchListings(false)} disabled={loading}
                style={{padding:'9px 28px',background:'#0f6e56',color:'#fff',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',borderRadius:0}}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selected && <OrsTransactDetail listing={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
