'use client';
// Site Options — internal warehouse sourcing inventory.
// Shows two tiers in a unified table:
//   • status === 'sourced' : admin-created, internal only, never public
//   • status === 'approved': developer-submitted marketplace listings (read-only here)
//
// All writes use PATCH /api/listings via useSiteOptions hook.
// The existing ListingForm is reused for add/edit (sourcedMode hides dev picker).
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { ListingForm } from '@/components/listing-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Archive, Pencil, Warehouse, Link as LinkIcon, X } from 'lucide-react';
import type { ListingSchema } from '@/lib/schema';

type FilterKey = 'all' | 'approved' | 'sourced' | 'linked-demand';

export default function SiteOptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { locationCircles, demands } = useData();
  const { siteOptions, isLoading, addSourcedListing, updateSourcedListing, archiveSourcedListing, updateDemandLinks } = useSiteOptions();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => {
    if (!authLoading && !hasAccess) router.push('/dashboard');
  }, [authLoading, hasAccess, router]);

  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterKey>('all');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingListing, setEditingListing] = React.useState<ListingSchema | null>(null);

  // Demand-link mini modal
  const [demandLinkSite, setDemandLinkSite] = React.useState<ListingSchema | null>(null);
  const [demandSearch, setDemandSearch] = React.useState('');
  const [selectedDemandIds, setSelectedDemandIds] = React.useState<string[]>([]);
  const [savingDemands, setSavingDemands] = React.useState(false);

  const filteredSites = siteOptions.filter(s => {
    if (filter === 'approved' && s.status !== 'approved') return false;
    if (filter === 'sourced' && s.status !== 'sourced') return false;
    if (filter === 'linked-demand' && (!(s as any).demandIds?.length)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.listingId.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      (s.warehouseModel || '').toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setEditingListing(null);
    setIsFormOpen(true);
  };

  const openEdit = (site: ListingSchema) => {
    if (site.status !== 'sourced') return; // approved listings are read-only here
    setEditingListing(site);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: ListingSchema) => {
    try {
      if (editingListing) {
        await updateSourcedListing(editingListing.listingId, { ...data, status: 'sourced' as any });
        toast({ title: 'Site updated' });
      } else {
        const newId = 'SRC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        await addSourcedListing({
          ...data,
          listingId: newId,
          developerId: user?.email || '',
          status: 'sourced' as any,
          createdAt: new Date().toISOString(),
          createdBy: user?.email,
        });
        toast({ title: 'Site added to inventory' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save. Please try again.' });
    }
  };

  const handleArchive = async (site: ListingSchema) => {
    if (!confirm(`Archive ${site.listingId}?\n\nThis will hide it from Site Options. If a developer later submits this warehouse formally, their submission will be the active record — just archive this one then.`)) return;
    await archiveSourcedListing(site.listingId);
    toast({ title: 'Site archived' });
  };

  const openDemandLink = (site: ListingSchema) => {
    setDemandLinkSite(site);
    setSelectedDemandIds((site as any).demandIds || []);
    setDemandSearch('');
  };

  const handleSaveDemandLinks = async () => {
    if (!demandLinkSite) return;
    setSavingDemands(true);
    await updateDemandLinks(demandLinkSite.listingId, selectedDemandIds);
    setSavingDemands(false);
    setDemandLinkSite(null);
    toast({ title: 'Demand links saved' });
  };

  const toggleDemand = (id: string) =>
    setSelectedDemandIds(ids => ids.includes(id) ? ids.filter(d => d !== id) : [...ids, id]);

  const filteredDemands = demandSearch
    ? demands.filter(d =>
        d.demandId.toLowerCase().includes(demandSearch.toLowerCase()) ||
        d.location?.toLowerCase().includes(demandSearch.toLowerCase()))
    : demands.slice(0, 8);

  if (authLoading || !hasAccess) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px 28px 56px', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Warehouse style={{ width: 14, height: 14, color: '#6141ac' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Site Options</p>
              <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>
                Internal sourcing inventory — single source of truth from master listings database
              </p>
            </div>
          </div>
          <Button onClick={openAdd} style={{ background: '#6141ac' }}>
            <Plus className="mr-2 h-4 w-4" /> Add sourced site
          </Button>
        </div>

        {/* Search + filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
            <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
            <Input
              placeholder="Search by ID, location or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
            />
          </div>
          {([
            { key: 'all', label: 'All sites' },
            { key: 'approved', label: 'ORS-ONE listings' },
            { key: 'sourced', label: 'Sourced, not listed' },
            { key: 'linked-demand', label: 'Linked to a demand' },
          ] as { key: FilterKey; label: string }[]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                background: filter === f.key ? '#6141ac' : 'transparent',
                color: filter === f.key ? '#fff' : 'hsl(259 15% 50%)',
                border: filter === f.key ? 'none' : '0.5px solid hsl(259 30% 85%)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', marginBottom: 12 }}>
          ORS-ONE listings are the live marketplace records — view only here. Sourced sites are your internal entries, editable from Site Options. Both feed into Transaction Dockets.
        </p>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', overflow: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: 24, fontSize: 13, color: 'hsl(259 15% 55%)' }}>Loading inventory...</p>
          ) : filteredSites.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>No sites match this view.</p>
              {filter === 'all' && (
                <p style={{ fontSize: 12, color: 'hsl(259 15% 65%)', marginTop: 6 }}>
                  Approved developer listings appear here automatically. Click "Add sourced site" to add a warehouse you've sourced informally.
                </p>
              )}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
                  {['Listing ID', 'Location', 'Model', 'Size (sq ft)', 'Source', 'Demands', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '10px 12px', color: 'hsl(259 15% 55%)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSites.map(site => {
                  const demandCount = (site as any).demandIds?.length || 0;
                  const isSourced = site.status === 'sourced';
                  return (
                    <tr key={site.listingId} style={{ borderBottom: '0.5px solid hsl(259 30% 92%)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e1537', fontFamily: 'monospace', fontSize: 12 }}>{site.listingId}</td>
                      <td style={{ padding: '10px 12px' }}>{site.location}</td>
                      <td style={{ padding: '10px 12px', color: site.warehouseModel ? '#1e1537' : 'hsl(259 15% 65%)' }}>{site.warehouseModel || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{site.sizeSqFt?.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isSourced ? (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#FAEEDA', color: '#854F0B' }}>Sourced</span>
                        ) : (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>ORS-ONE listing</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button
                          onClick={() => openDemandLink(site)}
                          title="Link to demands"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: demandCount ? '#6141ac' : 'hsl(259 15% 60%)', border: '0.5px solid', borderColor: demandCount ? '#6141ac' : 'hsl(259 30% 85%)', borderRadius: 6, padding: '2px 8px' }}>
                          <LinkIcon style={{ width: 10, height: 10 }} />
                          {demandCount ? `${demandCount} demand${demandCount > 1 ? 's' : ''}` : 'Link'}
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isSourced ? (
                          <>
                            <button onClick={() => openEdit(site)} title="Edit" style={{ marginRight: 10, color: 'hsl(259 15% 55%)' }}>
                              <Pencil style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => handleArchive(site)} title="Archive" style={{ color: 'hsl(259 15% 55%)' }}>
                              <Archive style={{ width: 14, height: 14 }} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: 'hsl(259 15% 60%)' }}>View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit form — reuses the real ListingForm with sourcedMode */}
      <ListingForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        listing={editingListing}
        onSubmit={handleFormSubmit}
        locationCircles={locationCircles}
        sourcedMode
      />

      {/* Demand-link mini modal */}
      {demandLinkSite && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setDemandLinkSite(null); }}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#1e1537', margin: 0 }}>Link to demands</p>
              <button onClick={() => setDemandLinkSite(null)}><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>{demandLinkSite.listingId} · {demandLinkSite.location}</p>

            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
              <Input
                placeholder="Search demand by ID or location..."
                value={demandSearch}
                onChange={e => setDemandSearch(e.target.value)}
                style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
              />
            </div>

            <div style={{ flex: 1, overflow: 'auto', border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8 }}>
              {filteredDemands.length === 0 ? (
                <p style={{ padding: 12, fontSize: 12, color: 'hsl(259 15% 60%)' }}>No demands found.</p>
              ) : filteredDemands.map(d => (
                <label key={d.demandId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedDemandIds.includes(d.demandId)} onChange={() => toggleDemand(d.demandId)} />
                  <span><strong>#{d.demandId}</strong> · {d.location} · {d.size?.toLocaleString()} sft</span>
                </label>
              ))}
            </div>

            {selectedDemandIds.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedDemandIds.map(id => (
                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'hsl(259 44% 94%)', color: '#6141ac', padding: '3px 8px', borderRadius: 999 }}>
                    #{id}
                    <button onClick={() => toggleDemand(id)}><X style={{ width: 10, height: 10 }} /></button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="outline" onClick={() => setDemandLinkSite(null)}>Cancel</Button>
              <Button onClick={handleSaveDemandLinks} disabled={savingDemands} style={{ background: '#6141ac' }}>
                {savingDemands ? 'Saving...' : 'Save links'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
