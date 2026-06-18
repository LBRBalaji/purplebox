'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Plus, Archive, Pencil, Warehouse } from 'lucide-react';
import type { SiteOptionSchema } from '@/lib/schema';

const WAREHOUSE_TYPES = ['Standalone', 'Multi-tenant', 'Built-to-suit', 'Cold storage'] as const;
type FilterKey = 'all' | 'listed' | 'sourced' | 'linked-demand';

const emptyForm = {
  linkedListingId: '',
  location: '',
  warehouseType: 'Standalone' as typeof WAREHOUSE_TYPES[number],
  sizeSqFt: '',
  transactionType: 'Lease' as 'Lease' | 'Sale',
  rentPerSqFt: '',
  saleRatePerSqFt: '',
  clearHeightMeters: '',
  dockDoors: '',
  fireNocStatus: '' as '' | 'In place' | 'Pending' | 'Not applicable',
  demandIds: [] as string[],
  sourceNotes: '',
};

export default function SiteOptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { listings, demands } = useData();
  const { siteOptions, isLoading, addSiteOption, updateSiteOption, archiveSiteOption } = useSiteOptions();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => {
    if (!authLoading && !hasAccess) router.push('/dashboard');
  }, [authLoading, hasAccess, router]);

  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterKey>('all');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [listingSearch, setListingSearch] = React.useState('');
  const [demandSearch, setDemandSearch] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const approvedListings = listings.filter(l => l.status === 'approved');
  const linkedListing = approvedListings.find(l => l.listingId === form.linkedListingId);
  const filteredListings = listingSearch
    ? approvedListings.filter(l =>
        l.listingId.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.location?.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.name?.toLowerCase().includes(listingSearch.toLowerCase()))
    : [];
  const filteredDemands = demandSearch
    ? demands.filter(d =>
        d.demandId.toLowerCase().includes(demandSearch.toLowerCase()) ||
        d.location?.toLowerCase().includes(demandSearch.toLowerCase()))
    : demands.slice(0, 6);

  const activeSites = siteOptions.filter(s => s.status !== 'archived');
  const filteredSites = activeSites.filter(s => {
    if (filter === 'listed' && !s.linkedListingId) return false;
    if (filter === 'sourced' && s.linkedListingId) return false;
    if (filter === 'linked-demand' && (!s.demandIds || s.demandIds.length === 0)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.siteOptionId.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.warehouseType.toLowerCase().includes(q);
  });

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setListingSearch('');
    setDemandSearch('');
    setIsFormOpen(true);
  };

  const openEditForm = (site: SiteOptionSchema) => {
    setEditingId(site.siteOptionId);
    setForm({
      linkedListingId: site.linkedListingId || '',
      location: site.location,
      warehouseType: site.warehouseType as any,
      sizeSqFt: String(site.sizeSqFt),
      transactionType: site.transactionType,
      rentPerSqFt: site.rentPerSqFt ? String(site.rentPerSqFt) : '',
      saleRatePerSqFt: site.saleRatePerSqFt ? String(site.saleRatePerSqFt) : '',
      clearHeightMeters: site.clearHeightMeters ? String(site.clearHeightMeters) : '',
      dockDoors: site.dockDoors ? String(site.dockDoors) : '',
      fireNocStatus: site.fireNocStatus || '',
      demandIds: site.demandIds || [],
      sourceNotes: site.sourceNotes || '',
    });
    setListingSearch('');
    setDemandSearch('');
    setIsFormOpen(true);
  };

  const handlePickListing = (listingId: string) => {
    const listing = approvedListings.find(l => l.listingId === listingId);
    if (!listing) return;
    setForm(f => ({
      ...f,
      linkedListingId: listingId,
      location: listing.location || f.location,
      sizeSqFt: listing.sizeSqFt ? String(listing.sizeSqFt) : f.sizeSqFt,
      rentPerSqFt: typeof listing.rentPerSqFt === 'number' ? String(listing.rentPerSqFt) : f.rentPerSqFt,
      clearHeightMeters: listing.buildingSpecifications?.eveHeightMeters ? String(listing.buildingSpecifications.eveHeightMeters) : f.clearHeightMeters,
      dockDoors: listing.buildingSpecifications?.numberOfDocksAndShutters ? String(listing.buildingSpecifications.numberOfDocksAndShutters) : f.dockDoors,
      fireNocStatus: listing.certificatesAndApprovals?.fireNOC ? 'In place' : f.fireNocStatus,
    }));
    setListingSearch('');
  };

  const toggleDemand = (demandId: string) => {
    setForm(f => ({
      ...f,
      demandIds: f.demandIds.includes(demandId) ? f.demandIds.filter(id => id !== demandId) : [...f.demandIds, demandId],
    }));
  };

  const canSubmit = form.location && form.sizeSqFt;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);
    try {
      const payload: any = {
        linkedListingId: form.linkedListingId || undefined,
        location: form.location,
        warehouseType: form.warehouseType,
        sizeSqFt: parseFloat(form.sizeSqFt),
        transactionType: form.transactionType,
        rentPerSqFt: form.rentPerSqFt ? parseFloat(form.rentPerSqFt) : undefined,
        saleRatePerSqFt: form.saleRatePerSqFt ? parseFloat(form.saleRatePerSqFt) : undefined,
        clearHeightMeters: form.clearHeightMeters ? parseFloat(form.clearHeightMeters) : undefined,
        dockDoors: form.dockDoors ? parseFloat(form.dockDoors) : undefined,
        fireNocStatus: form.fireNocStatus || undefined,
        demandIds: form.demandIds,
        sourceNotes: form.sourceNotes || undefined,
        status: 'active',
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateSiteOption(editingId, payload);
        toast({ title: 'Site updated' });
      } else {
        await addSiteOption({
          ...payload,
          sourcedBy: user.email,
          createdBy: user.email,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Site added to inventory' });
      }
      setIsFormOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save this site. Please try again.' });
    }
    setSubmitting(false);
  };

  const handleArchive = async (site: SiteOptionSchema) => {
    if (!confirm(`Archive ${site.siteOptionId}? It will be hidden from this list but kept for record.`)) return;
    await archiveSiteOption(site.siteOptionId);
    toast({ title: 'Site archived' });
  };

  if (authLoading || !hasAccess) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px 28px 56px', overflow: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Warehouse style={{ width: 14, height: 14, color: '#6141ac' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Site Options</p>
              <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>Internal warehouse sourcing inventory</p>
            </div>
          </div>
          <Button onClick={openAddForm} style={{ background: '#6141ac' }}>
            <Plus className="mr-2 h-4 w-4" /> Add site
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
            <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
            <Input placeholder="Search by site ID, location or type..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
          </div>
          {([
            { key: 'all', label: 'All sites' },
            { key: 'listed', label: 'ORS-ONE listings' },
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

        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', overflow: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: 24, fontSize: 13, color: 'hsl(259 15% 55%)' }}>Loading inventory...</p>
          ) : filteredSites.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>No sites match this view yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
                  {['Site ID', 'Location', 'Type', 'Size (sq ft)', 'Source', 'Linked to', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '10px 12px', color: 'hsl(259 15% 55%)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSites.map(site => (
                  <tr key={site.siteOptionId} style={{ borderBottom: '0.5px solid hsl(259 30% 92%)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e1537' }}>{site.siteOptionId}</td>
                    <td style={{ padding: '10px 12px' }}>{site.location}</td>
                    <td style={{ padding: '10px 12px' }}>{site.warehouseType}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{site.sizeSqFt.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {site.linkedListingId ? (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>ORS-ONE listing</span>
                      ) : (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#FAEEDA', color: '#854F0B' }}>Sourced, not listed</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'hsl(259 15% 55%)' }}>
                      {site.demandIds?.length ? `${site.demandIds.length} demand${site.demandIds.length > 1 ? 's' : ''}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEditForm(site)} title="Edit" style={{ marginRight: 10, color: 'hsl(259 15% 55%)' }}><Pencil style={{ width: 14, height: 14 }} /></button>
                      <button onClick={() => handleArchive(site)} title="Archive" style={{ color: 'hsl(259 15% 55%)' }}><Archive style={{ width: 14, height: 14 }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit site' : 'Add a site'}</DialogTitle>
            <DialogDescription>
              Link an existing ORS-ONE listing, or enter a warehouse you've sourced informally.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingId && (
              <div>
                <Label className="text-xs font-semibold">Search existing ORS-ONE listing (optional)</Label>
                <div style={{ position: 'relative', marginTop: 4 }}>
                  <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
                  <Input placeholder="Search by listing ID, location or name..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
                </div>
                {filteredListings.length > 0 && (
                  <div style={{ marginTop: 6, border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8, maxHeight: 160, overflow: 'auto' }}>
                    {filteredListings.map(l => (
                      <button key={l.listingId} onClick={() => handlePickListing(l.listingId)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)' }}>
                        <strong>{l.name || l.listingId}</strong> · {l.location} · {l.sizeSqFt?.toLocaleString()} sft
                      </button>
                    ))}
                  </div>
                )}
                {linkedListing && (
                  <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F1FB', color: '#0C447C', fontSize: 12, padding: '5px 10px', borderRadius: 8 }}>
                    Linked: {linkedListing.name || linkedListing.listingId}
                    <button onClick={() => setForm(f => ({ ...f, linkedListingId: '' }))}><X style={{ width: 12, height: 12 }} /></button>
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'hsl(259 15% 60%)', marginTop: 8 }}>or enter the details manually below</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Location <span className="text-destructive">*</span></Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Sriperumbudur, Chennai" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Warehouse type</Label>
                <select value={form.warehouseType} onChange={e => setForm(f => ({ ...f, warehouseType: e.target.value as any }))}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {WAREHOUSE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Size (sq ft) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.sizeSqFt} onChange={e => setForm(f => ({ ...f, sizeSqFt: e.target.value }))} placeholder="e.g. 42000" className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Clear height (m)</Label>
                <Input type="number" value={form.clearHeightMeters} onChange={e => setForm(f => ({ ...f, clearHeightMeters: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Dock doors</Label>
                <Input type="number" value={form.dockDoors} onChange={e => setForm(f => ({ ...f, dockDoors: e.target.value }))} className="mt-1 h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Transaction type</Label>
                <select value={form.transactionType} onChange={e => setForm(f => ({ ...f, transactionType: e.target.value as any }))}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="Lease">Lease</option>
                  <option value="Sale">Sale</option>
                </select>
              </div>
              {form.transactionType === 'Lease' ? (
                <div>
                  <Label className="text-xs font-semibold">Rent (₹/sft)</Label>
                  <Input type="number" value={form.rentPerSqFt} onChange={e => setForm(f => ({ ...f, rentPerSqFt: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
              ) : (
                <div>
                  <Label className="text-xs font-semibold">Sale rate (₹/sft)</Label>
                  <Input type="number" value={form.saleRatePerSqFt} onChange={e => setForm(f => ({ ...f, saleRatePerSqFt: e.target.value }))} className="mt-1 h-9 text-sm" />
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold">Fire NOC status</Label>
                <select value={form.fireNocStatus} onChange={e => setForm(f => ({ ...f, fireNocStatus: e.target.value as any }))}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Not noted</option>
                  <option value="In place">In place</option>
                  <option value="Pending">Pending</option>
                  <option value="Not applicable">Not applicable</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Link to demand(s)</Label>
              <div style={{ position: 'relative', marginTop: 4 }}>
                <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
                <Input placeholder="Search demand by ID or location..." value={demandSearch} onChange={e => setDemandSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
              </div>
              <div style={{ marginTop: 6, border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8, maxHeight: 140, overflow: 'auto' }}>
                {filteredDemands.length === 0 ? (
                  <p style={{ padding: 10, fontSize: 12, color: 'hsl(259 15% 60%)' }}>No demands found.</p>
                ) : filteredDemands.map(d => (
                  <label key={d.demandId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.demandIds.includes(d.demandId)} onChange={() => toggleDemand(d.demandId)} />
                    #{d.demandId} · {d.location} · {d.size?.toLocaleString()} sft
                  </label>
                ))}
              </div>
              {form.demandIds.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {form.demandIds.map(id => (
                    <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'hsl(259 44% 94%)', color: '#6141ac', padding: '3px 8px', borderRadius: 999 }}>
                      #{id}
                      <button onClick={() => toggleDemand(id)}><X style={{ width: 10, height: 10 }} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold">Internal notes</Label>
              <Textarea value={form.sourceNotes} onChange={e => setForm(f => ({ ...f, sourceNotes: e.target.value }))} placeholder="Not visible to clients..." className="mt-1 text-sm" rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ background: '#6141ac' }}>
                {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Add site'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
