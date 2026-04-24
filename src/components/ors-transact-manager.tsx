'use client';
import * as React from 'react';
import { Search, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrsTransactAdminForm } from './ors-transact-admin-form';
import { useToast } from '@/hooks/use-toast';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';

const PAGE_SIZE = 30;

export function OrsTransactManager() {
  const { toast } = useToast();
  const [listings, setListings] = React.useState<OrsTransactListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [facilityFilter, setFacilityFilter] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('');
  const [states, setStates] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<OrsTransactListing | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Load filter options
  React.useEffect(() => {
    fetch('/api/ors-transact?meta=states')
      .then(r => r.json())
      .then(d => setStates(d.states || []))
      .catch(() => {});
  }, []);

  const load = React.useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), seed: '1' });
    if (search) params.set('search', search);
    if (facilityFilter) params.set('facilityType', facilityFilter);
    if (stateFilter) params.set('state', stateFilter);
    try {
      const res = await fetch(`/api/ors-transact?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(search || facilityFilter || stateFilter ? (data.total || 0) : 9420);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch {}
    setLoading(false);
  }, [search, facilityFilter, stateFilter]);

  React.useEffect(() => { load(1); }, [search, facilityFilter, stateFilter]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await fetch('/api/ors-transact', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      toast({ title: 'Listing Deleted' });
      setConfirmDelete(null);
      load(page);
    } catch { toast({ variant: 'destructive', title: 'Delete failed' }); }
    setDeleting(false);
  };

  const FACILITY_TYPES = ['Warehouse', 'Industrial Building', 'VLR-Vacant Land Rental', 'Commercial Property'];

  if (editing) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setEditing(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6141ac', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} /> Back to listings
          </button>
        </div>
        <OrsTransactAdminForm
          existing={editing}
          onSaved={() => { setEditing(null); load(page); toast({ title: 'Listing Updated' }); }}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

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

  return (
    <div className="mt-4">
      {/* Header */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>ORS Transact Listings</p>
          <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: '2px 0 0' }}>
            {loading ? '—' : `${total.toLocaleString()} listings`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', padding: '6px 10px' }}>
          <Search style={{ width: 13, height: 13, color: 'hsl(259 15% 55%)', flexShrink: 0 }} />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
            onBlur={() => setSearch(searchInput)}
            placeholder="ORS ID, city, district..."
            style={{ flex: 1, fontSize: 12, outline: 'none', background: 'transparent', color: 'var(--color-text-primary)', border: 'none' }} />
          {searchInput && <button onClick={() => { setSearchInput(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(259 15% 55%)', padding: 0 }}><X style={{ width: 11, height: 11 }} /></button>}
        </div>
        <select value={facilityFilter} onChange={e => setFacilityFilter(e.target.value)}
          style={{ fontSize: 12, padding: '6px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', borderRadius: 0 }}>
          <option value="">All facility types</option>
          {FACILITY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
          style={{ fontSize: 12, padding: '6px 10px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', borderRadius: 0 }}>
          <option value="">All states</option>
          {states.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || facilityFilter || stateFilter) && (
          <button onClick={() => { setSearchInput(''); setSearch(''); setFacilityFilter(''); setStateFilter(''); }}
            style={{ fontSize: 11, color: 'hsl(259 15% 50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '0 6px' }}>
            <X style={{ width: 11, height: 11 }} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'hsl(259 15% 55%)', fontSize: 13 }}>Loading listings...</div>
      ) : listings.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'hsl(259 15% 55%)', fontSize: 13 }}>No listings match your filters</div>
      ) : (
        <>
          <div style={{ border: '0.5px solid hsl(259 30% 88%)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 120px 100px 130px 80px 100px 72px', background: 'hsl(259 44% 14%)', padding: '8px 12px', gap: 8 }}>
              {['ORS ID', 'Facility', 'City', 'District', 'State', 'Size (sft)', 'Actions'].map(h => (
                <p key={h} style={{ fontSize: 10, fontWeight: 600, color: 'hsl(259 44% 80%)', margin: 0, letterSpacing: '.04em' }}>{h}</p>
              ))}
            </div>
            {/* Rows */}
            {listings.map((l, i) => (
              <div key={l.id || l.ors_property_id}
                style={{ display: 'grid', gridTemplateColumns: '110px 120px 100px 130px 80px 100px 72px', padding: '8px 12px', gap: 8, alignItems: 'center', background: i % 2 === 0 ? 'var(--color-background-primary)' : 'hsl(259 44% 97%)', borderBottom: '0.5px solid hsl(259 30% 90%)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6141ac', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.ors_property_id}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.facility_type || '—'}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.city_location || '—'}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.district || '—'}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.state || '—'}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-primary)', margin: 0 }}>
                  {l.lease_area_as_advertised_in_sq_ft ? Number(l.lease_area_as_advertised_in_sq_ft).toLocaleString() : l.lease_area_range_in_sq_ft || '—'}
                </p>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => {
                    // Use startTransition to defer the 205-field form render
                    // preventing React error #300 during the list re-render
                    if (typeof React.startTransition === 'function') {
                      React.startTransition(() => setEditing(l));
                    } else {
                      setTimeout(() => setEditing(l), 0);
                    }
                  }}
                    title="Edit listing"
                    style={{ padding: '4px 7px', background: 'hsl(259 44% 94%)', border: '0.5px solid hsl(259 44% 80%)', cursor: 'pointer', borderRadius: 0, color: '#6141ac' }}>
                    <Edit2 style={{ width: 11, height: 11 }} />
                  </button>
                  {confirmDelete === (l.id || l.ors_property_id) ? (
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button onClick={() => handleDelete(l.id || l.ors_property_id)} disabled={deleting}
                        style={{ padding: '4px 6px', background: '#dc2626', border: 'none', cursor: 'pointer', borderRadius: 0, color: '#fff', fontSize: 10, fontWeight: 700 }}>
                        {deleting ? '...' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        style={{ padding: '4px 6px', background: 'hsl(259 30% 92%)', border: 'none', cursor: 'pointer', borderRadius: 0, fontSize: 10 }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(l.id || l.ors_property_id)}
                      title="Delete listing"
                      style={{ padding: '4px 7px', background: 'hsl(0 30% 96%)', border: '0.5px solid hsl(0 30% 85%)', cursor: 'pointer', borderRadius: 0, color: '#dc2626' }}>
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 12, flexWrap: 'wrap' }}>
              <button onClick={() => load(page - 1)} disabled={page === 1}
                style={{ padding: '5px 9px', fontSize: 12, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'hsl(259 15% 70%)' : 'var(--color-text-primary)', borderRadius: 0 }}>
                <ChevronLeft style={{ width: 13, height: 13 }} />
              </button>
              {pageNumbers.map((p, i) =>
                p === '...' ? <span key={`e${i}`} style={{ padding: '5px 4px', fontSize: 12, color: 'hsl(259 15% 55%)' }}>…</span> :
                <button key={p} onClick={() => load(p as number)}
                  style={{ padding: '5px 9px', minWidth: 32, fontSize: 12, background: p === page ? '#6141ac' : 'var(--color-background-primary)', color: p === page ? '#fff' : 'var(--color-text-primary)', border: `0.5px solid ${p === page ? '#6141ac' : 'hsl(259 30% 85%)'}`, cursor: 'pointer', fontWeight: p === page ? 600 : 400, borderRadius: 0 }}>
                  {p}
                </button>
              )}
              <button onClick={() => load(page + 1)} disabled={page === totalPages}
                style={{ padding: '5px 9px', fontSize: 12, background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 85%)', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'hsl(259 15% 70%)' : 'var(--color-text-primary)', borderRadius: 0 }}>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
              <span style={{ fontSize: 11, color: 'hsl(259 15% 55%)', marginLeft: 6 }}>
                Page {page} of {totalPages.toLocaleString()} · {total.toLocaleString()} listings
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
